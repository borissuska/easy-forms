requirejs = require('requirejs');
requirejs(__dirname + '/../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    plugins = requirejs('plugins/form-components');

describe('Integration test', function() {
    EasyForm.Plugins.addAll(plugins);

    it('minimal config', function() {
        expect(new EasyForm().form()).to.eql('');
    });

});