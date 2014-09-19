requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    LabelPlugin = requirejs('plugins/forms/checkbox');

EasyForm.Plugins.add('Checkbox', LabelPlugin);

describe('Checkbox plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Checkbox": 'Checkbox text'
            }
        });
        expect(ef.form()).to.be(
            '<div class="checkbox">' +
                '<label>' +
                    '<input type="checkbox"/>Checkbox text' +
                '</label>' +
            '</div>'
        );
    });

    it('full notation', function() {
        var ef = new EasyForm({
            "model": {
                "Checkbox": {
                    "settings": {
                        "id": 'checkboxId',
                        "name": 'checkboxName',
                        "value": 'val',
                        "text": "Checkbox text",
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
            '<div class="checkbox col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<label>' +
                    '<input id="checkboxId" type="checkbox" name="checkboxName" value="val"/>Checkbox text' +
                '</label>' +
            '</div>'
        )
    });

    it('full notation (inline)', function() {
        var ef = new EasyForm({
            "model": {
                "Checkbox": {
                    "settings": {
                        "id": 'checkboxId',
                        "name": 'checkboxName',
                        "value": 'val',
                        "text": "Checkbox text",
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
            '<label class="checkbox-inline visible-xs hidden-lg">' +
                '<input id="checkboxId" type="checkbox" name="checkboxName" value="val"/>Checkbox text' +
            '</label>'
        )
    });

    it('short notation', function() {
        var ef = new EasyForm({
            "model": {
                "Checkbox=checkboxName^val@xs:12+@lg>8:4-#checkboxId": "Checkbox text"
            }
        });
        expect(ef.form()).to.be(
            '<div class="checkbox col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<label>' +
                    '<input id="checkboxId" type="checkbox" name="checkboxName" value="val"/>Checkbox text' +
                '</label>' +
            '</div>'
        )
    });

    it('short notation (inline)', function() {
        var ef = new EasyForm({
            "model": {
                "Checkbox!=checkboxName^val@xs+@lg-#checkboxId": "Checkbox text"
            }
        });
        expect(ef.form()).to.be(
            '<label class="checkbox-inline visible-xs hidden-lg">' +
                '<input id="checkboxId" type="checkbox" name="checkboxName" value="val"/>Checkbox text' +
            '</label>'
        )
    });

    it('mixed notation', function() {
        var ef = new EasyForm({
            "model": {
                "Checkbox@xs:12+@lg>8:4-": {
                    "settings": {
                        "id": 'checkboxId',
                        "name": 'checkboxName',
                        "value": 'val',
                        "text": 'Checkbox text'
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class="checkbox col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<label>' +
                    '<input id="checkboxId" type="checkbox" name="checkboxName" value="val"/>Checkbox text' +
                '</label>' +
            '</div>'
        )
    });
});