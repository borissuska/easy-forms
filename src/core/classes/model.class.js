define(['core/classes/base.class'], function(Class) {
    return Class.extend({
        render: /* istanbul ignore next: always overridden by child class */ function() {
            return '';
        },
        toString: function() {
            return this.render();
        }
    });
});