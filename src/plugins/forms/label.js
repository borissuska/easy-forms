define([], function() {
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