define([], function() {
    if (!window.Handlebars) {
        throw 'Missing "handlebars.js" library. Decide to use runtime or full version depends on used plugins.';
    }
    return window.Handlebars;
});