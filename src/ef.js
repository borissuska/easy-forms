define([
    'core/classes/base.class',
    'core/plugins-map',
    'core/utils/merge',
    'core/utils/model',
    'core/utils/template'
], function(Class, PluginsMap, mergeUtil, modelUtil, templateUtil) {

    var EasyForms = Class.extend({
        init: function (settings) {
            var options = settings || {};

            //  override computed selectors and main grid
            EasyForms.Utils.merge(this, options);

            // convert model into EasyForm.Models instances
            if (this.model) {
                this.model = EasyForms.Utils.JSON2Model(this.model);
            }
        },
        form: function() {
            if (this.model) {
                return this.model.render();
            }
            return '';
        }
    });

    /**************************************************/
    /*   PLUGINS                                      */
    /**************************************************/

    EasyForms.Plugins = PluginsMap;

    /**************************************************/
    /*   UTILITY CLASSES                              */
    /**************************************************/

    EasyForms.Utils = {
        merge: mergeUtil,
        JSON2Model: modelUtil,
        renderTemplate: templateUtil
    };

    return EasyForms;
});