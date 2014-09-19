requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    LabelPlugin = requirejs('plugins/forms/radio');

EasyForm.Plugins.add('Radio', LabelPlugin);

describe('Radio plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Radio": 'Radio text'
            }
        });
        expect(ef.form()).to.be(
            '<div class="radio">' +
                '<label>' +
                    '<input type="radio"/>Radio text' +
                '</label>' +
            '</div>'
        );
    });

    it('full notation', function() {
        var ef = new EasyForm({
            "model": {
                "Radio": {
                    "settings": {
                        "id": 'radioId',
                        "name": 'radioName',
                        "value": 'val',
                        "text": "Radio text",
                        "inline": false,
                        "screen": {
                            "xs": {
                                "size": 12,
                                "visible": true
                            },
                            "lg": {
                                "size": 4,
                                "offset": 8,
                                "hidden": true
                            }
                        }
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class="radio col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<label>' +
                    '<input id="radioId" type="radio" name="radioName" value="val"/>Radio text' +
                '</label>' +
            '</div>'
        )
    });

    it('full notation (inline)', function() {
        var ef = new EasyForm({
            "model": {
                "Radio": {
                    "settings": {
                        "id": 'radioId',
                        "name": 'radioName',
                        "value": 'val',
                        "text": "Radio text",
                        "inline": true,
                        "screen": {
                            "xs": {
                                "visible": true
                            },
                            "lg": {
                                "hidden": true
                            }
                        }
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<label class="radio-inline visible-xs hidden-lg">' +
                '<input id="radioId" type="radio" name="radioName" value="val"/>Radio text' +
            '</label>'
        )
    });

    it('short notation', function() {
        var ef = new EasyForm({
            "model": {
                "Radio=radioName^val@xs:12+@lg>8:4-#radioId": "Radio text"
            }
        });
        expect(ef.form()).to.be(
            '<div class="radio col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<label>' +
                    '<input id="radioId" type="radio" name="radioName" value="val"/>Radio text' +
                '</label>' +
            '</div>'
        )
    });

    it('short notation (inline)', function() {
        var ef = new EasyForm({
            "model": {
                "Radio!=radioName^val@xs+@lg-#radioId": "Radio text"
            }
        });
        expect(ef.form()).to.be(
            '<label class="radio-inline visible-xs hidden-lg">' +
                '<input id="radioId" type="radio" name="radioName" value="val"/>Radio text' +
            '</label>'
        )
    });

    it('mixed notation', function() {
        var ef = new EasyForm({
            "model": {
                "Radio@xs:12+@lg>8:4-": {
                    "settings": {
                        "id": 'radioId',
                        "name": 'radioName',
                        "value": 'val',
                        "text": 'Radio text'
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class="radio col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<label>' +
                    '<input id="radioId" type="radio" name="radioName" value="val"/>Radio text' +
                '</label>' +
            '</div>'
        )
    });
});