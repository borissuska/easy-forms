requirejs = require('requirejs');
requirejs(__dirname + '/../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../src'
});

var expect = require('expect.js'),
    EasyForm = requirejs('ef'),
    modelUtil = requirejs('core/utils/model');

EasyForm.Plugins.add('SimpleClass', {
    "shortNameResolver": {
        "content": 'content'
    }
});
var SimpleClass = EasyForm.Plugins.get('SimpleClass');

EasyForm.Plugins.add('Class', {
    "shortNameResolver": {
        "-": 'settings.name',
        ".": 'settings.type',
        "content": 'settings.content'
    }
});
var Class = EasyForm.Plugins.get('Class');

describe('Model utility function test', function() {
    it('SimpleClass (string content)', function() {
        var obj = modelUtil({
            "SimpleClass": 'Content'
        });

        expect(obj).to.eql(new SimpleClass({
            content: 'Content'
        }));
    });

    it('SimpleClass (plain object content)', function() {
        var obj = modelUtil({
            "SimpleClass": {
                "aaa": 123
            }
        });

        expect(obj).to.eql(new SimpleClass({
            content: {
                "aaa": 123
            }
        }));
    });

    it('string content', function() {
        var obj = modelUtil({
            "Class": 'Content'
        });

        expect(obj).to.eql(new Class({
            settings: {
                content: 'Content'
            }
        }));
    });

    it('plain object content', function() {
        var obj = modelUtil({
            "Class": {}
        });

        expect(obj).to.eql(new Class({
            settings: {
                content: {}
            }
        }));
    });

    it('array content', function() {
        var obj = modelUtil({
            "Class": [
                'Text',
                'Text 2'
            ]
        });

        expect(obj).to.eql(new Class({
            settings: {
                content: [
                    'Text',
                    'Text 2'
                ]
            }
        }));
    });

    it('plugin content', function() {
        var obj = modelUtil({
            "Class": {
                "Class": 'Content'
            }
        });

        expect(obj).to.eql(new Class({
            settings: {
                content: new Class({
                    settings: {
                        content: 'Content'
                    }
                })
            }
        }));
    });

    it('mixed array content', function() {
        var obj = modelUtil({
            "Class": [
                {
                    "Class": 'Content'
                },
                'Plain text content',
                [
                    {
                        "Class": 'Inner plugin content'
                    },
                    'Text 1'
                ]
            ]
        });

        expect(obj).to.eql(new Class({
            settings: {
                content: [
                    new Class({
                        settings: {
                            content: 'Content'
                        }
                    }),
                    'Plain text content',
                    [
                        new Class({
                            settings: {
                                content: 'Inner plugin content'
                            }
                        }),
                        'Text 1'
                    ]
                ]
            }
        }));
    });

    it('short name resolver (one field)', function() {
        var obj = modelUtil({
            "Class-myName": 'Content'
        });

        expect(obj).to.eql(new Class({
            settings: {
                name: 'myName',
                content: 'Content'
            }
        }));
    });

    it('short name resolver (more fileds)', function() {
        var obj = modelUtil({
            "Class.myType-myName": 'Content'
        });

        expect(obj).to.eql(new Class({
            settings: {
                type: 'myType',
                name: 'myName',
                content: 'Content'
            }
        }));
    });

    it('short name resolver (fileds array)', function() {
        var obj = modelUtil({
            "Class.myType1.myType2.myType3": 'Content'
        });

        expect(obj).to.eql(new Class({
            settings: {
                type: ['myType1', 'myType2', 'myType3'],
                content: 'Content'
            }
        }));
    });

    it('short name resolver (any order)', function() {
        var obj = modelUtil({
            "Class-myName.myType": 'Content'
        });

        expect(obj).to.eql(new Class({
            settings: {
                type: 'myType',
                name: 'myName',
                content: 'Content'
            }
        }));
    });

    it('short name resolver (escaping)', function() {
        var obj = modelUtil({
            "Class.myType\\-escaped-myName\\.escaped": 'Content'
        });

        expect(obj).to.eql(new Class({
            settings: {
                type: 'myType-escaped',
                name: 'myName.escaped',
                content: 'Content'
            }
        }));
    });

    it('short name resolver (escaped backslash)', function() {
        var obj = modelUtil({
            "Class.myType\\-with\\\\backslash-myName\\.with\\\\": 'Content'
        });

        expect(obj).to.eql(new Class({
            settings: {
                type: 'myType-with\\backslash',
                name: 'myName.with\\',
                content: 'Content'
            }
        }));
    });

});
