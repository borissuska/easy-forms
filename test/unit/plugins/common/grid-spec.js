requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    GridPlugin = requirejs('plugins/common/grid');

EasyForm.Plugins.add('Grid', GridPlugin);

describe('Grid plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Grid": []
            }
        });
        expect(ef.form()).to.be(
            '<div></div>'
        )
    });

    it('full notation', function() {
        var ef = new EasyForm({
            "model": {
                "Grid": {
                    "settings": {
                        "id": 'formId',
                        "tagName": 'form',
                        "class": 'login',
                        "role": 'form',
                        "row": {
                            "tagName": 'div',
                            "class": 'form-group'
                        },
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
                        },
                        "rows": [
                            [], ['text'], [{"Grid": []}]
                        ]
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<form id="formId" class="login col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg" role="form">' +
                '<div class="form-group"></div>' +
                '<div class="form-group">text</div>' +
                '<div class="form-group"><div></div></div>' +
            '</form>'
        )
    });

    it('short notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Grid=form.login@xs:12+@lg>8:4-#formId": [
                    [], ['text'], [{"Grid": []}]
                ]
            }
        });
        expect(ef.form()).to.be(
            '<form id="formId" class="login col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<div></div>' +
                '<div>text</div>' +
                '<div><div></div></div>' +
            '</form>'
        )
    });

    it('mixed notation', function() {
        var ef = new EasyForm({
            "model": {
                "Grid=form@xs:12+@lg>8:4-": {
                    "settings": {
                        "id": 'formId',
                        "class": 'login',
                        "role": 'form',
                        "row": {
                            "tagName": 'div',
                            "class": 'form-group'
                        },
                        "rows": [
                            [], ['text'], [{"Grid": []}]
                        ]
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<form id="formId" class="login col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg" role="form">' +
                '<div class="form-group"></div>' +
                '<div class="form-group">text</div>' +
                '<div class="form-group"><div></div></div>' +
            '</form>'
        )
    });
});