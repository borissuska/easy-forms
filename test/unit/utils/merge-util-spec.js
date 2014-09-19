requirejs = require('requirejs');
requirejs(__dirname + '/../../../src/main');
requirejs.config({
    baseUrl: __dirname + '/../../../src'
});

var expect = require('expect.js'),
    mergeUtil = requirejs('core/utils/merge');

describe("Merge function test", function() {
    it("For one parameter merge to this", function() {
        var obj = {};
        expect(mergeUtil.call(obj, {})).to.be(obj);
    });

    it("Returns the instance passed as a first argument", function() {
        var obj = {};
        expect(mergeUtil(obj, {})).to.be(obj);
    });

    it("do not modify object after clone", function() {
        var objA = {},
            objB = {"inner": {}};
        expect(mergeUtil(true, objA, objB)).to.be(objA);
        expect(objA).to.eql({
            "inner": {}
        });
        objB.inner['test'] = 100;
        expect(objA).to.eql({
            "inner": {}
        });
        expect(objB).to.eql({
            "inner": {
                "test": 100
            }
        });
    });

    it("merge value into array", function() {
        var objA = ['A', 'B'],
            objB = 'C';
        expect(mergeUtil(true, objA, objB)).to.be(objA);
        expect(objA).to.eql(['C', 'B']);
    });


    it("Join instances", function() {
        var a = {
                "field1": 10,
                "field2": "hello"
            },
            b = {
                "field3": [1, 2, 3],
                "field4": {
                    "field5": 3.14
                }
            },
            c = mergeUtil(a, b);

        expect(a).to.be(c);
        expect(c).to.eql({
            "field1": 10,
            "field2": "hello",
            "field3": [1, 2, 3],
            "field4": {
                "field5": 3.14
            }
        });
    });

    it("Replace A by B", function() {
        var a = {
                "field1": 10,
                "field2": "hello"
            },
            b = {
                "field1": [1, 2, 3],
                "field2": {
                    "field3": 3.14
                }
            },
            c = mergeUtil(a, b);

        expect(a).to.be(c);
        expect(a).not.to.be(b);
        expect(a).to.eql(b);
        expect(c).to.eql({
            "field1": [1, 2, 3],
            "field2": {
                "field3": 3.14
            }
        });
    });

    it("Merge B into A", function() {
        var a = {
                "field1": 10,
                "field2": "hello"
            },
            b = {
                "field2": [1, 2, 3],
                "field3": {
                    "field4": 3.14
                }
            },
            c = mergeUtil(a, b);

        expect(a).to.be(c);
        expect(c).to.eql({
            "field1": 10,
            "field2": [1, 2, 3],
            "field3": {
                "field4": 3.14
            }
        });
    });

    it("Deep merge B into A", function() {
        var a = {
                "field1": 10,
                "field2": {
                    "field1": {
                        "field1": "hello",
                        "field2": "world"
                    },
                    "field2": 3.14
                }
            },
            b = {
                "field2": {
                    "field1": {
                        "field1": "hello merged"
                    }
                },
                "field3": {
                    "field1": 3.14
                }
            },
            c = mergeUtil(true, a, b);

        expect(a).to.be(c);
        expect(c).to.eql({
            "field1": 10,
            "field2": {
                "field1": {
                    "field1": "hello merged",
                    "field2": "world"
                },
                "field2": 3.14
            },
            "field3": {
                "field1": 3.14
            }
        });
    });
});
