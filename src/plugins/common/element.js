define(['core/utils/template', 'core/utils/merge', 'core/utils/types'], function(templateUtil, mergeUtil, TypesUtil) {
    return {
        shortNameResolver: {
            "=": "settings.tagName",
            "#": "settings.id",
            ".": "settings.class",
            "!": "settings.escape=0",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.content"
        },
        settings: {
            "tagName": 'div',
            "escape": null,
            "content": ''
        },
        control:
            '<{{tagName}}' +
                '{{#if id}} id="{{id}}"{{/if}}' +
                '{{#hasAny . "class,size,offset"}} class="{{join class " "}}{{> responsiveClasses}}"{{/hasAny}}' +
                '{{#if role}} role="{{role}}"{{/if}}' +
            '>{{#if escape}}{{content}}{{else}}{{{content}}}{{/if}}' +
            '</{{tagName}}>',

        init: function(attr) {
            mergeUtil(true, this, attr);
            this.__escapeSet = this.settings.escape !== null;
            if (this.settings.escape === null) {
                this.settings.escape = TypesUtil.isString(this.settings.content);
            }
        },
        render: function() {
            if (TypesUtil.isArray(this.settings.content)) {
                var content = this.settings.content;
                this.settings.content = '';
                for (var i=0; i < content.length; i++) {
                    if ((this.__escapeSet && !this.settings.escape) || (!this.__escapeSet && !TypesUtil.isString(content[i]))) {
                        this.settings.content += templateUtil('{{{.}}}', content[i]);
                    } else {
                        this.settings.content += templateUtil('{{.}}', content[i]);
                    }
                }
            }
            return templateUtil(this.control, this.settings);
        }
    };
});