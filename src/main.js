// Require.js allows us to configure shortcut alias
/* istanbul ignore next */
requirejs.config({
    baseUrl: '.',
    paths: {
        handlebars: function() {
            return require('handlebars');
        }
    }
});
