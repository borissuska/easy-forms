define([
    'core/utils/merge',
    'plugins/form-components',
    'plugins/common/grid',
    'plugins/common/element'
], function(mergeUtil, FormPlugins, GridClass, ElementClass){
    return mergeUtil(
        {},
        FormPlugins,
        {
            "Grid": GridClass,
            "Elem": ElementClass
        }
    )
});
