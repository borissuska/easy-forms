(function() {/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../node_modules/almond/almond", function(){});

// All credit to: https://gist.github.com/p0rsche/2763377
define('core/utils/types',[], function() {
    

    var _class2type = {},
        hasOwn = Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString;

    var _type = function( obj ) {
        return obj == null ?
            String( obj ) :
            _class2type[ toString.call(obj) ] || "object";
    };

    var _isWindow = function( obj ) {
        return obj != null && obj == obj.window;
    };

    var _isFunction = function(target){
        return toString.call(target) === "[object Function]";
    };

    var _isArray =  Array.isArray || function( obj ) {
        return _type(obj) === "array";
    };

    var _isPlainObject = function( obj ) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || _type(obj) !== "object" || obj.nodeType || _isWindow( obj ) ) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if ( obj.constructor &&
                !hasOwn.call(obj, "constructor") &&
                !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }
        } catch ( e ) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for ( key in obj ) {}

        return key === undefined || hasOwn.call( obj, key );
    };

    var _isString = function( obj ) {
        return typeof obj == 'string' || obj instanceof String;
    };

    return {
        class2type: _class2type,
        type: _type,
        isWindow: _isWindow,
        isFunction: _isFunction,
        isArray: _isArray,
        isPlainObject: _isPlainObject,
        isString: _isString
    }
});
define('core/utils/merge',['core/utils/types'], function(TypesUtil) {

    var _extend = function() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !TypesUtil.isFunction(target) ) {
            target = {};
        }

        if ( length === i ) {
            target = this;
            --i;
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( TypesUtil.isPlainObject(copy) || (copyIsArray = TypesUtil.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && TypesUtil.isArray(src) ? src : [];

                        } else {
                            clone = src && TypesUtil.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = _extend( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
        // Return the modified object
        return target;
    };

    return _extend;
});

define('core/classes/base.class',['core/utils/merge'], function(mergeUtil) {
    //noinspection BadExpressionStatementJS, JSCheckFunctionSignatures, JSUnresolvedVariable
    /* istanbul ignore next */
    var isCalled_super = /xyz/.test(function(){var xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    /* istanbul ignore next */
    var Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var parent = this;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        var prototype = Object.create(parent.prototype);

        // The dummy class constructor
        var Class = function() {
            // All construction is actually done in the init method
            /* istanbul ignore else */
            if ( this.init ) {
                this.init.apply(this, arguments);
            }
        };

        // Copy properties
        mergeUtil(Class, parent);

        // Copy the properties over onto the new prototype
        var static = {};
        for (var name in prop) {
            /* istanbul ignore else */
            if (prop.hasOwnProperty(name)) {
                if (typeof prop[name] == "function") {
                    // Check if we're overwriting an existing function
                    prototype[name] = prop[name];
                } else {
                    // static member
                    Class[name] = prop[name];
                    static[name] = prop[name];
                }
            }
        }

        Class.__super__ = parent.prototype;
        Class.__static__ = static;

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };

    return Class;
});
define('core/classes/model.class',['core/classes/base.class'], function(Class) {
    return Class.extend({
        render: /* istanbul ignore next: always overridden by child class */ function() {
            return '';
        },
        toString: function() {
            return this.render();
        }
    });
});
define('handlebars',[], function() {
    if (!window.Handlebars) {
        throw 'Missing "handlebars.js" library. Decide to use runtime or full version depends on used plugins.';
    }
    return window.Handlebars;
});
define('core/utils/template',['handlebars', 'core/utils/types'], function(Handlebars, TypesUtil) {

    var cache = {};

    Handlebars.registerHelper('hasAny', function(obj, fields, options) {
        function hasAny(obj, fields) {
            for (var v in obj) {
                /** istanbul ignore else */
                if (obj.hasOwnProperty(v)) {
                    if (fields.indexOf(v) >= 0) {
                        return true;
                    } else if (TypesUtil.isPlainObject(obj[v])) {
                        // recursive search
                        if (hasAny(obj[v], fields)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        return hasAny(obj, fields.split(/\s*,\s*/)) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('join', function(obj, glue) {
        if (TypesUtil.isPlainObject(glue)) {
            glue = ',';
        }
        var val = obj;
        if (TypesUtil.isArray(obj)) {
            val = obj.join(glue);
        }
        return val;
    });

    Handlebars.registerPartial('responsiveClasses',
        '{{#each screen}}' +
            '{{#if size}} col-{{@key}}-{{size}}{{/if}}' +
            '{{#if offset}} col-{{@key}}-offset-{{offset}}{{/if}}' +
            '{{#if visible}} visible-{{@key}}{{/if}}' +
            '{{#if hidden}} hidden-{{@key}}{{/if}}' +
        '{{/each}}'
    );

    Handlebars.registerPartial('responsiveVisibility',
        '{{#each screen}}' +
            '{{#if visible}} visible-{{@key}}{{/if}}' +
            '{{#if hidden}} hidden-{{@key}}{{/if}}' +
        '{{/each}}'
    );

    /**
     * Replace variables by real values.
     * @param template Template as a string
     * @param data values as a object
     */
    return function(template, data) {
        if (typeof template == 'function') {
            return template(data);
        } else if (typeof(cache[template]) === 'function' ) {
            return cache[template](data);
        }
        var compiledTemplate = Handlebars.compile(template);
        cache[template] = compiledTemplate;
        return compiledTemplate(data);
    };
});
define('core/classes/plugin.class',[
    'core/classes/model.class',
    'core/utils/merge',
    'core/utils/template'
], function(ModelClass, mergeUtil, templateUtil) {
    return ModelClass.extend({
        shortNameResolver: {
            "#": "settings.id",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings"
        },
        init: function(params) {
            mergeUtil(true, this, params);
        },
        render: function() {
            return templateUtil(this.control, this.settings);
        }
    });
});
define('core/plugins-map',['core/classes/plugin.class', 'core/utils/merge'], function(PluginClass, mergeUtil) {
    return {
        map: {},
        add: function (name, plugin) {
            var CustomPluginClass = PluginClass.extend(mergeUtil({}, plugin, {
                init: function(params) {
                    mergeUtil(true, this, CustomPluginClass.__static__);
                    if (plugin.init) {
                        plugin.init.apply(this, arguments);
                    } else {
                        CustomPluginClass.__super__.init.apply(this, arguments);
                    }
                }
            }));
            return this.map[name] = CustomPluginClass;
        },
        addAll: function (plugins) {
            var pluginClasses = {};
            for (var pluginName in plugins) {
                /* istanbul ignore else */
                if (plugins.hasOwnProperty(pluginName)) {
                    pluginClasses[pluginName] = this.add(pluginName, plugins[pluginName]);
                }
            }
            return pluginClasses;
        },
        get: function(name) {
            if (this.map[name]) {
                return this.map[name];
            }
            return null;
        }
    };
});
define('core/utils/model',['core/utils/merge', 'core/utils/types', 'core/plugins-map'], function(mergeUtil, TypesUtil, PluginsMap) {

    /**
     * Returns empty object defined by dot notation.
     * Example:
     * 'field' => {field: null},
     * 'class.field' => {class: {'field': null}}
     * ...
     * @param str
     * @param defaultValue
     */
    function dotsToObj(str, defaultValue) {
        var fields = str.split(/\./),
            last = null,
            prev = defaultValue;

        for (var i=fields.length-1; i >= 0; i--) {
            last = {};
            last[fields[i]] = prev;
            prev = last;
        }
        return last;
    }

    function shortValueToObj(propertyName, value, variables) {
        // set appropriate value
        if (/^\d+(\.\d*)?$/.test(value)) {
            value = parseFloat(value);
        }
        if (propertyName.indexOf('*') == 0) {
            variables['{{' + propertyName.substr(1) + '}}'] = value;
        } else {
            return dotsToObj(propertyName, value);
        }
    }

    function getShortValue(object, propertyName, variables) {
        var name = propertyName.split(/\./);
        for (var i=0; i < name.length; i++) {
            if (variables[name[i]]) {
                object = object[variables[name[i]]];
            } else {
                object = object[name[i]];
            }
            if (!object) {
                return object;
            }
        }
        return object;
    }

    function replaceVariables(string, variables) {
        for (var variable in variables) {
            if (variables.hasOwnProperty(variable)) {
                string = string.replace(variable, variables[variable]);
            }
        }
        return string;
    }

    function splitFieldName(field, shortNameResolver) {
        var keys = [];
        for(var k in shortNameResolver) {
            if (shortNameResolver.hasOwnProperty(k) && k != 'content') {
                keys.push(k.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'));
            }
        }
        var components = [],
            nonEscaped = [],
            j = 0,
            str = '',
            escape = false;
        if (keys.length > 0) {
            nonEscaped = field.split(new RegExp('(' + keys.join('|') + ')'));
        }
        for (var i=0; i<nonEscaped.length; i++) {
            str += nonEscaped[i];
            // is non escaped backslash on last position
            if (!escape) {
                if (str.lastIndexOf('\\') !== str.length - 1 || str.length === 0 || str.lastIndexOf('\\\\') === str.length - 2) {
                    // replace \\ by \
                    components[j++] = str.replace(/\\\\/g, '\\');
                    str = '';
                } else {
                    str = str.substr(0, str.length - 1);
                    escape = true;
                }
            } else {
                escape = false;
            }
        }
        return components;
    }

    function _JSON2Model(json) {
        var i, value;

        // handle arrays
        if (TypesUtil.isArray(json)) {
            for (i=0; i<json.length; i++) {
                json[i] = _JSON2Model(json[i]);
            }
            return json;
        }

        // handle object
        var model, fieldsCount = 0;

        if (!TypesUtil.isPlainObject(json)) {
            model = json;
        } else {
            model = {};
            for (var field in json) {
                /* istanbul ignore else */
                if (json.hasOwnProperty(field)) {
                    value = json[field];

                    if (TypesUtil.isArray(value)) {
                        for (i = 0; i < value.length; i++) {
                            value[i] = _JSON2Model(value[i]);
                        }
                    } else {
                        value = _JSON2Model(value);
                    }

                    model[field] = value;
                    fieldsCount++;
                }
            }
        }

        // handle model classes
        if (fieldsCount == 1) {
            // check if it is a model
            var components = field.split(/(:?[^\w]+)/),
                classRef;

            value = model[field];

            // field name starts with plugin class name (Grid, Elem, Label, ...)
            if (components.length % 2 == 1 && (classRef = PluginsMap.get(components[0]))) {
                var shortNameResolver = classRef.shortNameResolver || {},
                    dataByName = {};

                // reassign components by shortNameResolver field (using cache)
                components = splitFieldName(field, shortNameResolver);

                // translate field name to component data
                var propertyName = false,
                    variables = {},
                    shortValue, assignedValue;
                for (i=1; i<components.length; i++) {
                    if (propertyName) {
                        // set appropriate value
                        shortValue = shortValueToObj(propertyName, components[i], variables);
                        if (shortValue) {
                            if (assignedValue = getShortValue(dataByName, propertyName, variables)) {
                                if (TypesUtil.isArray(assignedValue)) {
                                    assignedValue.push(components[i]);
                                } else {
                                    mergeUtil(true, dataByName, dotsToObj(propertyName, [assignedValue, components[i]]));
                                }
                            } else {
                                mergeUtil(true, dataByName, shortValue);
                            }
                        }
                        propertyName = false;
                    } else if (components[i]) {
                        // get property name
                        propertyName = replaceVariables(shortNameResolver[components[i]], variables);
                        if (propertyName.indexOf('=') >= 0) {
                            propertyName = propertyName.split('=');
                            // set appropriate value
                            shortValue = shortValueToObj(propertyName[0], propertyName[1], variables);
                            if (shortValue) {
                                mergeUtil(true, dataByName, shortValue);
                            }
                            propertyName = false;
                        }
                    }
                }

                // check if value is shortened too
                var resolvableFields = {},
                    isShortened = true;
                if (TypesUtil.isPlainObject(value)) {
                    var fieldShortName, fieldName;

                    for (fieldShortName in shortNameResolver) {
                        /* istanbul ignore else */
                        if (shortNameResolver.hasOwnProperty(fieldShortName)) {
                            fieldName = shortNameResolver[fieldShortName];
                            if (fieldName.indexOf('*') !== 0 && fieldName.indexOf('=') < 0 && fieldName.indexOf('{{') < 0 && fieldName.indexOf('}}') < 0) {
                                mergeUtil(true, resolvableFields, dotsToObj(shortNameResolver[fieldShortName], null));
                            }
                        }
                    }

                    for (fieldShortName in value) {
                        if (resolvableFields.hasOwnProperty(fieldShortName)) {
                            isShortened = false;
                            break;
                        }
                    }
                }

                if (isShortened) {
                    if (typeof(shortNameResolver.content) !== 'undefined') {
                        mergeUtil(true, dataByName, dotsToObj(shortNameResolver.content, value));
                    } else if (TypesUtil.isPlainObject(value)) {
                        mergeUtil(true, dataByName, value);
                    }
                    value = null;
                }

                // create instance
                model = new classRef(mergeUtil(true, dataByName, value));
            }
        }
        return model;
    }

    /**
     * Convert JSON data to internal model.
     * @type {JSON2Model}
     */
    return function(json) {
//        var model = {};
//        for (var width in json) {
//            /* istanbul ignore else */
//            if (json.hasOwnProperty(width)) {
//                model[width] = _JSON2Model(json[width]);
//            }
//        }
        return _JSON2Model(json);
    };
});
define('ef',[
    'core/classes/base.class',
    'core/plugins-map',
    'core/utils/merge',
    'core/utils/model',
    'core/utils/template'
], function(Class, PluginsMap, mergeUtil, modelUtil, templateUtil) {

    var EasyForms = Class.extend({
        init: function (settings) {
            var options = settings || {};

            //  override computed selectors and main grid
            EasyForms.Utils.merge(this, options);

            // convert model into EasyForm.Models instances
            if (this.model) {
                this.model = EasyForms.Utils.JSON2Model(this.model);
            }
        },
        form: function() {
            if (this.model) {
                return this.model.render();
            }
            return '';
        }
    });

    /**************************************************/
    /*   PLUGINS                                      */
    /**************************************************/

    EasyForms.Plugins = PluginsMap;

    /**************************************************/
    /*   UTILITY CLASSES                              */
    /**************************************************/

    EasyForms.Utils = {
        merge: mergeUtil,
        JSON2Model: modelUtil,
        renderTemplate: templateUtil
    };

    return EasyForms;
});
define('ef-core',['ef'], function(ef){
    EasyForms = ef;
});

define('plugins/forms/label',[], function() {
    return {
        /**
         * Example notations:
         * Label->email@xs-@sm-@md:4,
         */
        "shortNameResolver": {
            "->": "settings.for",
            "#": "settings.id",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.text"
        },
        "control":
            '<label' +
                '{{#if id}} id="{{id}}"{{/if}}' +
                '{{#if for}} for="{{for}}"{{/if}}' +
                ' class="control-label{{> responsiveClasses}}">' +
                '{{text}}' +
            '</label>'
    };
});
define('plugins/forms/input',[], function() {
    return {
        /**
         * Example notations:
         * Input.email=email@xs-@sm-@md:6
         */
        shortNameResolver: {
            "=": "settings.name",
            ".": "settings.type",
            "#": "settings.id",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.placeholder"
        },
        "control":
            '{{#hasAny screen "size,offset"}}<div class="{{> responsiveClasses}}">{{/hasAny}}' +
                '<input' +
                    '{{#if id}} id="{{id}}"{{/if}}' +
                    ' type="{{type}}"' +
                    '{{#if name}} name="{{name}}"{{/if}}' +
                    ' class="form-control{{> responsiveVisibility}}"' +
                    '{{#if placeholder}} placeholder="{{placeholder}}"{{/if}}' +
                    '{{#if disabled}} disabled="{{disabled}}"{{/if}}' +
                    '{{#if readonly}} readonly="{{readonly}}"{{/if}}' +
                    '{{#if multiple}} multiple="{{readonly}}"{{/if}}' +
                '/>' +
            '{{#hasAny screen "size,offset"}}</div>{{/hasAny}}',
        // default values
        "settings": {
            "type": 'text'
        }
    };
});
define('plugins/forms/select',['core/utils/merge', 'core/utils/types'], function(mergeUtil, TypesUtils) {
    return {
        shortNameResolver: {
            "=": "settings.name",
            "#": "settings.id",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.options"
        },
        "init": function(params) {
            var options = params.settings.options;
            params.options = null;
            mergeUtil(this, params);
            this.settings.options = [];

            if (TypesUtils.isArray(options)) {
                for (var i = 0; i < options.length; i++) {
                    if (TypesUtils.isPlainObject(options[i])) {
                        this.settings.options.push(options[i]);
                    } else {
                        var opt = options[i].split(':');
                        if (opt.length > 1) {
                            this.settings.options.push({
                                "value": opt[0],
                                "text": opt[1]
                            });
                        } else {
                            this.settings.options.push({
                                "text": opt[0]
                            });
                        }
                    }
                }
            }
        },
        "control":
            '{{#hasAny screen "size,offset"}}<div class="{{> responsiveClasses}}">{{/hasAny}}' +
                '<select' +
                    '{{#if id}} id="{{id}}"{{/if}}' +
                    '{{#if name}} name="{{name}}"{{/if}}' +
                    ' class="form-control{{> responsiveVisibility}}"' +
                    '{{#if disabled}} disabled="{{disabled}}"{{/if}}' +
                '>{{#each options}}<option{{#if value}} value="{{value}}"{{/if}}>{{text}}</option>{{/each}}' +
                '</select>' +
            '{{#hasAny screen "size,offset"}}</div>{{/hasAny}}'
    };
});
define('plugins/forms/textarea',[], function() {
    return {
        "shortNameResolver": {
            "=": "settings.name",
            "#": "settings.id",
            "%": "settings.rows",
            ",": "settings.cols",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.placeholder"
        },
        "control":
            '{{#hasAny screen "size,offset"}}<div class="{{> responsiveClasses}}">{{/hasAny}}' +
                '<textarea' +
                    '{{#if id}} id="{{id}}"{{/if}}' +
                    '{{#if name}} name="{{name}}"{{/if}}' +
                    ' class="form-control"' +
                    '{{#if rows}} rows="{{rows}}"{{/if}}' +
                    '{{#if cols}} cols="{{cols}}"{{/if}}' +
                    '{{#if placeholder}} placeholder="{{placeholder}}"{{/if}}' +
                '></textarea>' +
            '{{#hasAny screen "size,offset"}}</div>{{/hasAny}}'
    };
});
define('plugins/forms/checkbox',[], function() {
    return {
        shortNameResolver: {
            "=": "settings.name",
            "^": "settings.value",
            "#": "settings.id",
            "!": "settings.inline=1",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.text"
        },
        "control":
            '{{#unless inline}}<div class="checkbox{{> responsiveClasses}}">{{/unless}}' +
                '<label{{#if inline}} class="checkbox-inline{{> responsiveVisibility}}"{{/if}}>' +
                    '<input' +
                        '{{#if id}} id="{{id}}"{{/if}}' +
                        ' type="checkbox"' +
                        '{{#if name}} name="{{name}}"{{/if}}' +
                        '{{#if value}} value="{{value}}"{{/if}}' +
                    '/>{{text}}' +
                '</label>' +
            '{{#unless inline}}</div>{{/unless}}'
    };
});
define('plugins/forms/radio',[], function() {
    return {
        shortNameResolver: {
            "=": "settings.name",
            "^": "settings.value",
            "#": "settings.id",
            "!": "settings.inline=1",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.text"
        },
        "control":
            '{{#unless inline}}<div class="radio{{> responsiveClasses}}">{{/unless}}' +
                '<label{{#if inline}} class="radio-inline{{> responsiveVisibility}}"{{/if}}>' +
                    '<input' +
                        '{{#if id}} id="{{id}}"{{/if}}' +
                        ' type="radio"' +
                        '{{#if name}} name="{{name}}"{{/if}}' +
                        '{{#if value}} value="{{value}}"{{/if}}' +
                    '/>{{text}}' +
                '</label>' +
            '{{#unless inline}}</div>{{/unless}}'
    };
});
define('plugins/forms/button',[], function() {
    return {
        /**
         * Example notations:
         * Input.email=email@xs-@sm-@md:6
         */
        shortNameResolver: {
            "=": "settings.visualStyle",
            ".": "settings.type",
            "#": "settings.id",
            "!": "settings.escape=0",
            "::": "settings.size",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.text"
        },
        "control":
            '{{#hasAny screen "size,offset"}}<div class="{{> responsiveClasses}}">{{/hasAny}}' +
                '<button' +
                    '{{#if id}} id="{{id}}"{{/if}}' +
                    ' type="{{type}}"' +
                    '{{#if name}} name="{{name}}"{{/if}}' +
                    '{{#if value}} value="{{value}}"{{/if}}' +
                    ' class="btn btn-{{visualStyle}}{{#if size}} btn-{{size}}{{/if}}{{#hasAny screen "size"}} btn-block{{/hasAny}}{{> responsiveVisibility}}"' +
                    '{{#if disabled}} disabled="{{disabled}}"{{/if}}' +
                    '>{{#if escape}}{{text}}{{else}}{{{text}}}{{/if}}</button>' +
            '{{#hasAny screen "size,offset"}}</div>{{/hasAny}}',
        // default values
        "settings": {
            "type": 'button',
            "visualStyle": 'default'
        }
    };
});
define('plugins/form-components',[
    'plugins/forms/label',
    'plugins/forms/input',
    'plugins/forms/select',
    'plugins/forms/textarea',
    'plugins/forms/checkbox',
    'plugins/forms/radio',
    'plugins/forms/button'
], function(LabelPlugin, InputPlugin, SelectPlugin, TextareaPlugin, CheckboxPlugin, RadioPlugin, ButtonPlugin) {
    return {
        "Label": LabelPlugin,
        "Input": InputPlugin,
        "Select": SelectPlugin,
        "Textarea": TextareaPlugin,
        "Checkbox": CheckboxPlugin,
        "Radio": RadioPlugin,
        "Button": ButtonPlugin
    }
});
define('plugins/common/grid',[
    'core/utils/template',
    'core/utils/merge'
], function(templateUtil, mergeUtil) {

    return {
        shortNameResolver: {
            "#": "settings.id",
            "=": "settings.tagName",
            ".": "settings.class",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.rows"
        },
        settings: {
            tagName: 'div',
            row: {
                tagName: 'div'
            },
            rows: []
        },
        render: function() {
            var rowsHtml = '';
            for (var i=0; i < this.settings.rows.length; i++) {
                var row = '';
                for (var j = 0; j < this.settings.rows[i].length; j++) {
                    if (typeof this.settings.rows[i][j].render === 'function') {
                        row += this.settings.rows[i][j].render();
                    } else {
                        row += this.settings.rows[i][j];
                    }
                }
                rowsHtml += templateUtil('<{{name}}{{#if class}} class="{{class}}"{{/if}}>{{{content}}}</{{name}}>', {
                    name: this.settings.row.tagName,
                    class: this.settings.row.class,
                    content: row
                });
            }
            return templateUtil(
                    '<{{tagName}}' +
                        '{{#if id}} id="{{id}}"{{/if}}' +
                        '{{#hasAny . "class,size,offset"}} class="{{class}}{{>responsiveClasses}}"{{/hasAny}}' +
                        '{{#if role}} role="{{role}}"{{/if}}' +
                    '>{{{content}}}' +
                    '</{{tagName}}>', mergeUtil({}, this.settings, {content: rowsHtml}));
        }
    };
});
define('plugins/common/element',['core/utils/template', 'core/utils/merge', 'core/utils/types'], function(templateUtil, mergeUtil, TypesUtil) {
    return {
        shortNameResolver: {
            "=": "settings.tagName",
            "#": "settings.id",
            ".": "settings.class",
            "!": "settings.escape=0",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.content"
        },
        settings: {
            "tagName": 'div',
            "escape": null,
            "content": ''
        },
        control:
            '<{{tagName}}' +
                '{{#if id}} id="{{id}}"{{/if}}' +
                '{{#hasAny . "class,size,offset"}} class="{{join class " "}}{{> responsiveClasses}}"{{/hasAny}}' +
                '{{#if role}} role="{{role}}"{{/if}}' +
            '>{{#if escape}}{{content}}{{else}}{{{content}}}{{/if}}' +
            '</{{tagName}}>',

        init: function(attr) {
            mergeUtil(true, this, attr);
            this.__escapeSet = this.settings.escape !== null;
            if (this.settings.escape === null) {
                this.settings.escape = TypesUtil.isString(this.settings.content);
            }
        },
        render: function() {
            if (TypesUtil.isArray(this.settings.content)) {
                var content = this.settings.content;
                this.settings.content = '';
                for (var i=0; i < content.length; i++) {
                    if ((this.__escapeSet && !this.settings.escape) || (!this.__escapeSet && !TypesUtil.isString(content[i]))) {
                        this.settings.content += templateUtil('{{{.}}}', content[i]);
                    } else {
                        this.settings.content += templateUtil('{{.}}', content[i]);
                    }
                }
            }
            return templateUtil(this.control, this.settings);
        }
    };
});
define('ef-plugins',[
    'core/utils/merge',
    'plugins/form-components',
    'plugins/common/grid',
    'plugins/common/element'
], function(mergeUtil, FormPlugins, GridClass, ElementClass){
    return mergeUtil(
        {},
        FormPlugins,
        {
            "Grid": GridClass,
            "Elem": ElementClass
        }
    )
});

define('ef-full',['ef-core', 'ef-plugins'], function(ef, Plugins){
    EasyForms.Plugins.addAll(Plugins);
});


define("easyforms-v0.8.0-full", function(){});
require('ef-full');}());