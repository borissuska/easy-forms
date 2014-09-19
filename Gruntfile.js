module.exports = function(grunt) {

    // Load the plugin that provides requirejs.
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Load the plugin that provides istanbul code coverage over mocha tests
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile_min: {
                options: {
                    keepBuildDir: true,
                    dir: "dist",
                    baseDir: ".",
                    appDir: "src",
                    mainConfigFile: "src/main.js",

                    paths: {
                        handlebars: "deps/handlebars"
                    },

                    modules: [
                        // Full build = easy forms core and default plugins
                        {
                            "name": "<%= pkg.name %>-v<%= pkg.version %>-full.min",
                            "create": true,
                            "include": ["../node_modules/almond/almond", "ef-full"]
                        }
                    ],

                    optimize: "uglify2",
                    wrap: {
                        start: "(function() {",
                        end: "require('ef-full');}());"
                    },
                    removeCombined: true,
                    fileExclusionRegExp: "/^\\.|main.js|bindings.js|/"
                }
            },
            compile: {
                options: {
                    keepBuildDir: true,
                    dir: "dist",
                    baseDir: ".",
                    appDir: "src",
                    mainConfigFile: "src/main.js",

                    paths: {
                        handlebars: "deps/handlebars"
                    },

                    modules: [
                        // Full build = easy forms core and default plugins
                        {
                            "name": "<%= pkg.name %>-v<%= pkg.version %>-full",
                            "create": true,
                            "include": ["../node_modules/almond/almond", "ef-full"]
                        }
                    ],

                    optimize: "none",
                    wrap: {
                        start: "(function() {",
                        end: "require('ef-full');}());"
                    },
                    removeCombined: true,
                    fileExclusionRegExp: "/^\\.|main.js|bindings.js|/"
                }
            }
        },
        mocha_istanbul: {
            cover: {
                src: 'test/unit', // the folder, not the files
                options: {
                    coverage: true,
                    istanbulOptions: ['--hook-run-in-context'],
                    mochaOptions: ['--recursive'],
                    check: {
                        statements: 85,
                        branches: 85,
                        functions: 85,
                        lines: 85
                    },
                    root: './src' // define where the cover task should consider the root of libraries that are covered by tests
                }
            }
        }
    });

    // Tasks
    grunt.registerTask('default', ['dist', 'test']);
    grunt.registerTask('dist', ['requirejs']);
    grunt.registerTask('test', ['mocha_istanbul:cover']);

};