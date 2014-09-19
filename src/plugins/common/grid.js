define([
    'core/utils/template',
    'core/utils/merge'
], function(templateUtil, mergeUtil) {

    return {
        shortNameResolver: {
            "#": "settings.id",
            "=": "settings.tagName",
            ".": "settings.class",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings.rows"
        },
        settings: {
            tagName: 'div',
            row: {
                tagName: 'div'
            },
            rows: []
        },
        render: function() {
            var rowsHtml = '';
            for (var i=0; i < this.settings.rows.length; i++) {
                var row = '';
                for (var j = 0; j < this.settings.rows[i].length; j++) {
                    if (typeof this.settings.rows[i][j].render === 'function') {
                        row += this.settings.rows[i][j].render();
                    } else {
                        row += this.settings.rows[i][j];
                    }
                }
                rowsHtml += templateUtil('<{{name}}{{#if class}} class="{{class}}"{{/if}}>{{{content}}}</{{name}}>', {
                    name: this.settings.row.tagName,
                    class: this.settings.row.class,
                    content: row
                });
            }
            return templateUtil(
                    '<{{tagName}}' +
                        '{{#if id}} id="{{id}}"{{/if}}' +
                        '{{#hasAny . "class,size,offset"}} class="{{class}}{{>responsiveClasses}}"{{/hasAny}}' +
                        '{{#if role}} role="{{role}}"{{/if}}' +
                    '>{{{content}}}' +
                    '</{{tagName}}>', mergeUtil({}, this.settings, {content: rowsHtml}));
        }
    };
});