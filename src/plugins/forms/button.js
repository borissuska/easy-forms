define([], function() {
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