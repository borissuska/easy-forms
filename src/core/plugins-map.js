define(['core/classes/plugin.class', 'core/utils/merge'], function(PluginClass, mergeUtil) {
    return {
        map: {},
        add: function (name, plugin) {
            var CustomPluginClass = PluginClass.extend(mergeUtil({}, plugin, {
                init: function(params) {
                    mergeUtil(true, this, CustomPluginClass.__static__);
                    if (plugin.init) {
                        plugin.init.apply(this, arguments);
                    } else {
                        CustomPluginClass.__super__.init.apply(this, arguments);
                    }
                }
            }));
            return this.map[name] = CustomPluginClass;
        },
        addAll: function (plugins) {
            var pluginClasses = {};
            for (var pluginName in plugins) {
                /* istanbul ignore else */
                if (plugins.hasOwnProperty(pluginName)) {
                    pluginClasses[pluginName] = this.add(pluginName, plugins[pluginName]);
                }
            }
            return pluginClasses;
        },
        get: function(name) {
            if (this.map[name]) {
                return this.map[name];
            }
            return null;
        }
    };
});