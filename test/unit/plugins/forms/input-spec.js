requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    InputPlugin = requirejs('plugins/forms/input');

EasyForm.Plugins.add('Input', InputPlugin);

describe('Input plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Input": null
            }
        });
        expect(ef.form()).to.be(
            '<input type="text" class="form-control"/>'
        )
    });

    it('full notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Input": {
                    "settings": {
                        "name": 'inputName',
                        "id": 'myId',
                        "type": 'email',
                        "placeholder": "E-mail",
                        "disabled": 'disabled',
                        "readonly": 'readonly',
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
                        }
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<input id="myId" type="email" name="inputName" class="form-control visible-xs hidden-lg" placeholder="E-mail" disabled="disabled" readonly="readonly"/>' +
            '</div>'
        )
    });

    it('short notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Input.email=inputName@xs:12+@lg>8:4-#myId": 'E-mail'
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<input id="myId" type="email" name="inputName" class="form-control visible-xs hidden-lg" placeholder="E-mail"/>' +
            '</div>'
        )
    });

    it('short notation (with visible and hidden)', function() {
        var ef = new EasyForm({
            "model": {
                "Input.email=inputName@xs+@lg-#myId": 'E-mail'
            }
        });
        expect(ef.form()).to.be(
            '<input id="myId" type="email" name="inputName" class="form-control visible-xs hidden-lg" placeholder="E-mail"/>'
        )
    });

    it('short notation (without size)', function() {
        var ef = new EasyForm({
            "model": {
                "Input.email=inputName#myId": 'E-mail'
            }
        });
        expect(ef.form()).to.be(
            '<input id="myId" type="email" name="inputName" class="form-control" placeholder="E-mail"/>'
        )
    });

    it('medium notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Input.email=inputName@xs:12+@lg>8:4-#myId": {
                    "settings": {
                        "placeholder": 'E-mail',
                        "disabled": 'true',
                        "readonly": 'true'
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<input id="myId" type="email" name="inputName" class="form-control visible-xs hidden-lg" placeholder="E-mail" disabled="true" readonly="true"/>' +
            '</div>'
        )
    });
});