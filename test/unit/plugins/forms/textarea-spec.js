requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    LabelPlugin = requirejs('plugins/forms/textarea');

EasyForm.Plugins.add('Textarea', LabelPlugin);

describe('Textarea plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Textarea": ""
            }
        });
        expect(ef.form()).to.be(
            '<textarea class="form-control"></textarea>'
        );
    });

    it('full notation', function() {
        var ef = new EasyForm({
            "model": {
                "Textarea": {
                    "settings": {
                        "id": 'areaId',
                        "name": 'areaName',
                        "rows": 20,
                        "cols": 10,
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
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<textarea id="areaId" name="areaName" class="form-control" rows="20" cols="10"></textarea>' +
            '</div>'
        )
    });

    it('short notation', function() {
        var ef = new EasyForm({
            "model": {
                "Textarea=areaName%20,10@xs:12+@lg>8:4-#areaId": ""
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<textarea id="areaId" name="areaName" class="form-control" rows="20" cols="10"></textarea>' +
            '</div>'
        )
    });

    it('mixed notation', function() {
        var ef = new EasyForm({
            "model": {
                "Textarea@xs+:12@lg-:4": {
                    "settings": {
                        "id": 'areaId',
                        "name": 'areaName',
                        "rows": 20,
                        "cols": 10
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<div class=" col-xs-12 visible-xs col-lg-4 hidden-lg">' +
                '<textarea id="areaId" name="areaName" class="form-control" rows="20" cols="10"></textarea>' +
            '</div>'
        )
    });
});