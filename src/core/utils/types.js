// All credit to: https://gist.github.com/p0rsche/2763377
define([], function() {
    "use strict";

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