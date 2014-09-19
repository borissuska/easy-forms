define([
    'plugins/forms/label',
    'plugins/forms/input',
    'plugins/forms/select',
    'plugins/forms/textarea',
    'plugins/forms/checkbox',
    'plugins/forms/radio',
    'plugins/forms/button'
], function(LabelPlugin, InputPlugin, SelectPlugin, TextareaPlugin, CheckboxPlugin, RadioPlugin, ButtonPlugin) {
    return {
        "Label": LabelPlugin,
        "Input": InputPlugin,
        "Select": SelectPlugin,
        "Textarea": TextareaPlugin,
        "Checkbox": CheckboxPlugin,
        "Radio": RadioPlugin,
        "Button": ButtonPlugin
    }
});