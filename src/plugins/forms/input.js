define([], function() {
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