module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

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
                                "start": ";(function (root, factory) {if (typeof define === 'function' && define.amd) {define([], factory);} else {root.EngageSDK = factory();}}(this, function() {",
                                "end": "return EngageSDK;}));"
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
                                            "if (typeof define === 'function' && define.amd) {" +
                                                "define(['jquery', 'EngageSDK'], factory);" +
                                            "} else {" +
                                                "root.EngageToolbar = factory(root.jQuery, root.EngageSDK);" +
                                            "}" +
                                        "}(this, function(jQuery, EngageSDK) {" +
                                            "var jquery = jQuery;",
                                "end": "return EngageToolbar;}));"
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

        // copy: {
        //     build: {
        //         files: [
        //             {
        //                 src: ["src/index.html"],
        //                 dest: ".webBuild/index.html"
        //             },
        //             {
        //                 src: ["src/APITester.html"],
        //                 dest: ".webBuild/APITester.html"
        //             },
        //             {
        //                 src: [".buildjs/RequireConfig.js"],
        //                 dest: ".webBuild/js/RequireConfig.js"
        //             },
        //             {
        //                 src: [".buildjs/Portal.js"],
        //                 dest: ".webBuild/js/Portal.js"
        //             },
        //             {
        //                 src: [".buildjs/APITester.js"],
        //                 dest: ".webBuild/js/APITester.js"
        //             },
        //             {
        //                 src: ["src/js/components/requirejs/require.js"],
        //                 dest: ".webBuild/js/components/requirejs/require.js"
        //             },
        //             {
        //                 expand: true,
        //                 cwd: "src/",
        //                 src: ["css/**", "fonts/**", "images/**"],
        //                 dest: ".webBuild/"
        //             }
        //         ]
        //     }
        // }

    });

    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-concurrent");

    grunt.registerTask("build", ["sass:toolbar", "requirejs:sdk", "requirejs:toolbar"]);
    grunt.registerTask("default", ["concurrent:compile"]);

};
