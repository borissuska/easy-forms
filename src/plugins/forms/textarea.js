define([], function() {
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