module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        bump: {
            options: {
                files: ["package.json"],
                updateConfigs: ["pkg"],
                commit: true,
                commitMessage: "Release v%VERSION%",
                commitFiles: ["package.json"],
                createTag: true,
                tagName: "v%VERSION%",
                tagMessage: "Version %VERSION%",
                push: false,
                gitDescribeOptions: "--tags --always --abbrev=1 --dirty=-d"
            }
        },

        requirejs: {
            sdk: {
                options: {
                    mainConfigFile: "src/js/engage-sdk/build.js",
                    out: "build/sdk.js",
                    baseUrl: "src/js",
                    paths: {
                    //    //almond: "components/almond/almond",
                    //    "event-dispatcher": "components/event-dispatcher/src",
                        EngageSDK: "engage-sdk/sdk"
                    },
                    include: [
                        "gibberish.aes",
                        "event-dispatcher/EventDispatcher",
                        "engage-sdk/services/BaseRESTService",
                        "engage-sdk/services/KeepAliveService",
                        "EngageSDK"
                    ],
                    //wrap: {
                    //    startFile: "src/js/engage-sdk/wrapStart.txt",
                    //    endFile: "src/js/engage-sdk/wrapEnd.txt"
                    //},
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    optimize: "none",
                    onModuleBundleComplete: function (data) {
                        var fs = require('fs');
                        var amdclean = require('amdclean');
                        var outputFile = data.path;
                        fs.writeFileSync(outputFile, amdclean.clean({
                            "filePath": outputFile,
                            "wrap": {
                                "start": ";(function (root, factory) {" +
                                                "root.EngageSDK = factory();" +
                                            "}(this, function() {",
                                "end": "if(typeof define === 'function' && define.amd ) {" +
                                            "define('EngageSDK', [], function() {" +
                                                "return EngageSDK;" +
                                            "});" +
                                        "}" +
                                        "jQuery.noConflict();" +
                                        "return EngageSDK;" +
                                    "}));"
                            }
                        }));
                    }
                }
            },
            toolbar: {
                options: {
                    mainConfigFile: "src/js/widgets/toolbar/build.js",
                    out: "build/toolbar.js",
                    baseUrl: "src/js",
                    paths: {
                        //almond: "components/almond/almond",
                        EngageToolbar: "widgets/toolbar/toolbar"
                    },
                    include: ["EngageToolbar"],
                    exclude: ["jquery"],
                    //wrap: {
                    //    startFile: "src/js/widgets/toolbar/wrapStart.txt",
                    //    endFile: "src/js/widgets/toolbar/wrapEnd.txt"
                    //},
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    optimize: "none",
                    onModuleBundleComplete: function (data) {
                        var fs = require('fs');
                        var amdclean = require('amdclean');
                        var outputFile = data.path;
                        fs.writeFileSync(outputFile, amdclean.clean({
                            "filePath": outputFile,
                            "wrap": {
                                "start": ";(function (root, factory) {" +
                                                "root.EngageToolbar = factory(root.jQuery, root.EngageSDK);" +
                                            "}(this, function(jQuery, EngageSDK) {" +
                                                "var jquery = jQuery;",
                                "end": "if(typeof define === 'function' && define.amd ) {" +
                                            "define('EngageToolbar', [], function() {" +
                                                "return EngageToolbar;" +
                                            "});" +
                                        "}" +
                                        "return EngageToolbar;" +
                                    "}));"
                            }
                        }));
                    }
                }
            }
        },

        sass: {
            toolbar: {
                options: {
                    style: "compressed",
                    sourcemap: "none"
                },
                files: {
                    "build/toolbar.css": "src/css/widgets/toolbar/toolbar.scss"
                }
            }
        },

        watch: {
            "scss-toolbar": {
                files: "src/css/widgets/toolbar/*.scss",
                tasks: ["sass:toolbar"]
            },
            "js-sdk": {
                files: "src/js/engage-sdk/**/*.js",
                tasks: ["requirejs:sdk"]
            },
            "js-toolbar": {
                files: "src/js/widgets/**/*.js",
                tasks: ["requirejs:toolbar"]
            }
        },

        // clean: {
        //     // build: [".buildjs", "cordova/www"],
        //     build: ["build", ".buildjs"],
        //     bower: ["src/js/components"]
        // },

        concurrent: {
            compile: {
                tasks: ["watch:scss-toolbar", "watch:js-sdk", "watch:js-toolbar"],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        uglify: {
            compile: {
                options: {
                    mangle: true,
                    preserveComments: false
                },
                files: {
                    'build/sdk.js': ['build/sdk.js'],
                    'build/toolbar.js': ['build/toolbar.js']
                }
            }
        },

        replace: {
            version: {
                options: {
                    patterns: [
                        {
                            match: "version",
                            replacement: '<%= pkg.version %>'
                        }
                    ]
                },
                files: [
                    {src: ["build/sdk.js"], dest: "build/sdk.js"}
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-replace");

    grunt.registerTask("build", ["sass:toolbar", "requirejs:sdk", "requirejs:toolbar", "replace:version", "uglify:compile"]);
    grunt.registerTask("deploy", ["bump", "build"]);
    grunt.registerTask("default", ["concurrent:compile"]);

};
