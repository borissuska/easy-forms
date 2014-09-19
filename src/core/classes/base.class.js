define(['core/utils/merge'], function(mergeUtil) {
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