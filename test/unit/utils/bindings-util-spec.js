requirejs = require('requirejs');
requirejs(__dirname + '/../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../src'
});

var expect = require('expect.js'),
    bindingsUtil = requirejs('core/utils/bindings');

describe("Binding function test", function() {
    it("Target only", function () {
        expect(bindingsUtil('click', ['click', 'hover'])).to.eql({
            "selector": '',
            "target": ['click']
        });
    });

    it("Selector and target only", function () {
        expect(bindingsUtil('.class click', ['click', 'hover'])).to.eql({
            "selector": '.class',
            "target": ['click']
        });
    });

    it("Not allowed target", function () {
        expect(bindingsUtil('.class clickme', ['click', 'hover'])).to.eql({
            "selector": '.class clickme',
            "target": []
        });
    });

    it("More targets without selector", function () {
        expect(bindingsUtil('click,hover', ['click', 'hover'])).to.eql({
            "selector": '',
            "target": ['click', 'hover']
        });
    });

    it("More targets without selector (whitespaces)", function () {
        expect(bindingsUtil('click  , hover', ['click', 'hover'])).to.eql({
            "selector": '',
            "target": ['click', 'hover']
        });
    });

    it("More targets and selector", function () {
        expect(bindingsUtil('.class click,hover', ['click', 'hover'])).to.eql({
            "selector": '.class',
            "target": ['click', 'hover']
        });
    });

    it("More targets and selector (whitespaces)", function () {
        expect(bindingsUtil('.class     click , hover', ['click', 'hover'])).to.eql({
            "selector": '.class',
            "target": ['click', 'hover']
        });
    });
});