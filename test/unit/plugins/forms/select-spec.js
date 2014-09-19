requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    SelectPlugin = requirejs('plugins/forms/select');

EasyForm.Plugins.add('Select', SelectPlugin);

describe('Select plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Select": []
            }
        });
        expect(ef.form()).to.be(
            '<select class="form-control"></select>'
        );

        // options should be an object
        ef = new EasyForm({
            "model": {
                "Select": {}
            }
        });
        expect(ef.form()).to.be(
            '<select class="form-control"></select>'
        )
    });

    it('full notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Select": {
                    "settings": {
                        "id": 'myId',
                        "name": 'selectName',
                        "disabled": 'disabled',
                        "options": [
                            'default',
                            {
                                "text": 'one',
                                "value": 1
                            }, {
                                "text": 'two',
                                "value": 2
                            }, {
                                "text": 3,
                                "value": 'three'
                            }
                        ],
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
                '<select id="myId" name="selectName" class="form-control visible-xs hidden-lg" disabled="disabled">' +
                    '<option>default</option>' +
                    '<option value="1">one</option>' +
                    '<option value="2">two</option>' +
                    '<option value="three">3</option>' +
                '</select>' +
            '</div>');
    });

    it('short notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Select=selectName@xs:12+@lg>8:4-#myId": [
                    'default',
                    '1:one',
                    '2:two',
                    'three:3'
                ]
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<select id="myId" name="selectName" class="form-control visible-xs hidden-lg">' +
                '<option>default</option>' +
                '<option value="1">one</option>' +
                '<option value="2">two</option>' +
                '<option value="three">3</option>' +
            '</select>' +
        '</div>'
        )
    });

    it('short notation (with visible and hidden)', function() {
        var ef = new EasyForm({
            "model": {
                "Select=selectName@xs+@lg-#myId": [
                    'default',
                    '1:one',
                    '2:two',
                    'three:3'
                ]
            }
        });
        expect(ef.form()).to.be(
            '<select id="myId" name="selectName" class="form-control visible-xs hidden-lg">' +
                '<option>default</option>' +
                '<option value="1">one</option>' +
                '<option value="2">two</option>' +
                '<option value="three">3</option>' +
            '</select>'
        );
    });

    it('short notation (without size)', function() {
        var ef = new EasyForm({
            "model": {
                "Select=selectName#myId": [
                    'default',
                    '1:one',
                    '2:two',
                    'three:3'
                ]
            }
        });
        expect(ef.form()).to.be(
            '<select id="myId" name="selectName" class="form-control">' +
                '<option>default</option>' +
                '<option value="1">one</option>' +
                '<option value="2">two</option>' +
                '<option value="three">3</option>' +
            '</select>'
        )
    });

    it('medium notation (with size & offset)', function() {
        var ef = new EasyForm({
            "model": {
                "Select=selectName@xs:12+@lg>8:4-#myId": {
                    "settings": {
                        "disabled": 'true',
                        "options": [
                            'default',
                            '1:one',
                            '2:two',
                            'three:3'
                        ]
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<select id="myId" name="selectName" class="form-control visible-xs hidden-lg" disabled="true">' +
                    '<option>default</option>' +
                    '<option value="1">one</option>' +
                    '<option value="2">two</option>' +
                    '<option value="three">3</option>' +
                '</select>' +
            '</div>'
        )
    });
});