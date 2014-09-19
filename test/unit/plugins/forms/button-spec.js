requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    ButtonPlugin = requirejs('plugins/forms/button');

EasyForm.Plugins.add('Button', ButtonPlugin);

describe('Button plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Button": null
            }
        });
        expect(ef.form()).to.be(
            '<button type="button" class="btn btn-default"></button>'
        )
    });

    it('full notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Button": {
                    "settings": {
                        "visualStyle": 'primary',
                        "id": 'buttonId',
                        "type": 'submit',
                        "text": 'Submit',
                        "size": 'xs',
                        "name": 'btn1',
                        "value": '1',
                        "disabled": false,
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
                '<button id="buttonId" type="submit" name="btn1" value="1" class="btn btn-primary btn-xs btn-block visible-xs hidden-lg">Submit</button>' +
            '</div>'
        )
    });

    it('short notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Button.submit=primary::lg@xs:12+@lg>8:4-#buttonId": 'Submit'
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<button id="buttonId" type="submit" class="btn btn-primary btn-lg btn-block visible-xs hidden-lg">Submit</button>' +
            '</div>'
        )
    });

    it('short notation (with offset only)', function() {
        var ef = new EasyForm({
            "model": {
                "Button.submit=primary::lg@lg>8#buttonId": 'Submit'
            }
        });
        expect(ef.form()).to.be(
                '<div class=" col-lg-offset-8">' +
                    '<button id="buttonId" type="submit" class="btn btn-primary btn-lg">Submit</button>' +
                '</div>'
        )
    });

    it('short notation (with visible and hidden)', function() {
        var ef = new EasyForm({
            "model": {
                "Button.submit=primary@xs+@lg-#buttonId": 'Submit'
            }
        });
        expect(ef.form()).to.be(
            '<button id="buttonId" type="submit" class="btn btn-primary visible-xs hidden-lg">Submit</button>'
        )
    });

    it('short notation (without size)', function() {
        var ef = new EasyForm({
            "model": {
                "Button.submit=primary#buttonId": 'Submit'
            }
        });
        expect(ef.form()).to.be(
            '<button id="buttonId" type="submit" class="btn btn-primary">Submit</button>'
        )
    });

    it('medium notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Button.submit=primary::lg@xs:12+@lg>8:4-#buttonId": {
                    "settings": {
                        "text": 'Submit',
                        "disabled": 'true'
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<button id="buttonId" type="submit" class="btn btn-primary btn-lg btn-block visible-xs hidden-lg" disabled="true">Submit</button>' +
            '</div>'
        )
    });
});