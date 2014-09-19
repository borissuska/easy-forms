define(['handlebars', 'core/utils/types'], function(Handlebars, TypesUtil) {

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