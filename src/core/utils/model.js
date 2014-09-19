define(['core/utils/merge', 'core/utils/types', 'core/plugins-map'], function(mergeUtil, TypesUtil, PluginsMap) {

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