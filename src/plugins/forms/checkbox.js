define([], function() {
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