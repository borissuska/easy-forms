requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    LabelPlugin = requirejs('plugins/forms/label');

EasyForm.Plugins.add('Label', LabelPlugin);

describe('Label plugin test', function() {
    it('full notation', function() {
        var ef = new EasyForm({
            "model": {
                "Label": {
                    "settings": {
                        "for": 'inputId',
                        "id": 'myId',
                        "screen": {
                            "xs": {
                                "size": 12,
                                "offset": 0,
                                "visible": true
                            },
                            "lg": {
                                "size": 4,
                                "offset": 8,
                                "hidden": true
                            }
                        },
                        "text": 'Label text'
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<label id="myId" for="inputId" class="control-label col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                'Label text' +
            '</label>'
        )
    });

    it('short notation', function() {
        var ef = new EasyForm({
            "model": {
                "Label->inputId@xs:12+@lg>8:4-#myId": 'Label text'
            }
        });
        expect(ef.form()).to.be(
            '<label id="myId" for="inputId" class="control-label col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                'Label text' +
            '</label>'
        )
    });

    it('mixed notation', function() {
        var ef = new EasyForm({
            "model": {
                "Label@xs+:12@lg-:4": {
                    "settings": {
                        "for": 'inputId',
                        "id": 'myId',
                        "text": 'Label text',
                        "screen": {
                            "lg": {
                                "offset": 8
                            }
                        }
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<label id="myId" for="inputId" class="control-label col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                'Label text' +
            '</label>'
        )
    });
});