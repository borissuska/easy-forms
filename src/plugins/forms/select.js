define(['core/utils/merge', 'core/utils/types'], function(mergeUtil, TypesUtils) {
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