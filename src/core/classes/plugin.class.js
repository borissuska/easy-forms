define([
    'core/classes/model.class',
    'core/utils/merge',
    'core/utils/template'
], function(ModelClass, mergeUtil, templateUtil) {
    return ModelClass.extend({
        shortNameResolver: {
            "#": "settings.id",
            "@": "*screen",
            ":": "settings.screen.{{screen}}.size",
            ">": "settings.screen.{{screen}}.offset",
            "+": "settings.screen.{{screen}}.visible=1",
            "-": "settings.screen.{{screen}}.hidden=1",
            "content": "settings"
        },
        init: function(params) {
            mergeUtil(true, this, params);
        },
        render: function() {
            return templateUtil(this.control, this.settings);
        }
    });
});