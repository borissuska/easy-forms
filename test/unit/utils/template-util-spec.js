requirejs = require('requirejs');
requirejs(__dirname + '/../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../src'
});

var expect = require('expect.js'),
    templateUtil = requirejs('core/utils/template');

describe("template function test", function() {
    it('Compile on runtime', function() {
        expect(templateUtil('{{text}}', {text: 'My text...'})).to.be('My text...');

    });

    it('pre-compiled templates', function() {
        var Handlebars = require('handlebars'),
            template = Handlebars.compile('{{text}}');

        expect(templateUtil(template, {text: 'My text...'})).to.be('My text...');
    });

    it('join helper', function() {
        expect(templateUtil('{{join val " "}}', {val: [1, 2, 3]})).to.be('1 2 3');
        expect(templateUtil('{{join val}}', {val: [1, 2, 3]})).to.be('1,2,3');
        expect(templateUtil('{{join val}}', {val: 'Text value'})).to.be('Text value');
    });
});