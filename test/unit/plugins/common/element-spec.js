requirejs = require('requirejs');
requirejs(__dirname + '/../../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    ElemPlugin = requirejs('plugins/common/element');

EasyForm.Plugins.add('Elem', ElemPlugin);

describe('Common element plugin test', function() {
    it('minimal config', function() {
        var ef = new EasyForm({
            "model": {
                "Elem": null
            }
        });
        expect(ef.form()).to.be(
            '<div></div>'
        )
    });

    it('full notation', function() {
        var ef = new EasyForm({
            "model": {
                "Elem": {
                    "settings": {
                        "id": 'elemId',
                        "tagName": 'p',
                        "class": 'success',
                        "role": 'article',
                        "escape": false,
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
                        "content": '<strong>Element HTML content</strong>'
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<p id="elemId" class="success col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg" role="article">' +
                '<strong>Element HTML content</strong>' +
            '</p>'
        )
    });

    it('short notation', function() {
        var ef = new EasyForm({
            "model": {
                "Elem=p.success!@xs:12+@lg>8:4-#elemId": '<strong>Element HTML content</strong>'
            }
        });
        expect(ef.form()).to.be(
            '<p id="elemId" class="success col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<strong>Element HTML content</strong>' +
            '</p>'
        )
    });

    it('mixed notation', function() {
        var ef = new EasyForm({
            "model": {
                "Elem!@xs:12+@lg>8:4-": {
                    "settings": {
                        "id": 'elemId',
                        "tagName": 'p',
                        "class": 'success',
                        "role": 'article',
                        "content": '<strong>Element HTML content</strong>'
                    }
                }
            }
        });
        expect(ef.form()).to.be(
            '<p id="elemId" class="success col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg" role="article">' +
                '<strong>Element HTML content</strong>' +
            '</p>'
        )
    });

    it('plugin content (escaped outer)', function() {
        var ef = new EasyForm({
            "model": {
                "Elem=p!": {
                    "Elem=strong": 'Element <b>HTML</b> content'
                }
            }
        });
        expect(ef.form()).to.be(
            '<p>' +
                '<strong>Element &lt;b&gt;HTML&lt;/b&gt; content</strong>' +
            '</p>'
        )
    });

    it('plugin content (escaped inner)', function() {
        var ef = new EasyForm({
            "model": {
                "Elem=p": {
                    "Elem=strong!": 'Element <b>HTML</b> content'
                }
            }
        });
        expect(ef.form()).to.be(
                '<p>' +
                '<strong>Element <b>HTML</b> content</strong>' +
                '</p>'
        )
    });

    it('array content (escaped outer)', function() {
        var ef = new EasyForm({
            "model": {
                "Elem=p!": [
                    {
                        "Elem=strong": 'Escaped <b>HTML</b> content'
                    },
                    "<br/>",
                    "Another <b>HTML</b> content"
                ]
            }
        });
        expect(ef.form()).to.be(
            '<p>' +
                '<strong>Escaped &lt;b&gt;HTML&lt;/b&gt; content</strong>' +
                '<br/>' +
                'Another <b>HTML</b> content' +
            '</p>'
        )
    });

    it('array content (escaped inner)', function() {
        var ef = new EasyForm({
            "model": {
                "Elem=p": [
                    {
                        "Elem=strong!": 'Non escaped <b>HTML</b> content'
                    },
                    "<br/>",
                    "Escaped <b>HTML</b> content"
                ]
            }
        });
        expect(ef.form()).to.be(
                '<p>' +
                    '<strong>Non escaped <b>HTML</b> content</strong>' +
                    '&lt;br/&gt;' +
                    'Escaped &lt;b&gt;HTML&lt;/b&gt; content' +
                '</p>'
        )
    });

    it('short notation (more classes)', function() {
        var ef = new EasyForm({
            "model": {
                "Elem=p.success.row!@xs:12+@lg>8:4-#elemId": '<strong>Element HTML content</strong>'
            }
        });
        expect(ef.form()).to.be(
            '<p id="elemId" class="success row col-xs-12 visible-xs col-lg-4 col-lg-offset-8 hidden-lg">' +
                '<strong>Element HTML content</strong>' +
            '</p>'
        )
    });
});