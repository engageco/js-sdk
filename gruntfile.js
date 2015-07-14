module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        requirejs: {
            compile: {
                options: {
                    mainConfigFile: "src/js/config.js",
                    out: "build/sdk.js",
                    baseUrl: "src/js",
                    // name: "sdk",
                    paths: {
                        EngageSDK: "sdk",
                        requirejs: "components/requirejs/require"
                    },
                    include: ["requirejs", "EngageSDK"],
                    wrap: {
                        startFile: "src/js/wrapStart.txt",
                        endFile: "src/js/wrapEnd.txt"
                    },
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    optimize: "none"
                    // dir: ".buildjs",
                    // skipDirOptimize: false,
                    // modules: [
                    //     {name: "APITester"},
                    //     {name: "Portal"}
                    // ],
                    // removeCombined: true,
                    // uglify2: {
                    //     mangle: false
                    // }
                }
            }
        },

        // sass: {
        //     dist: {
        //         options: {
        //             style: "compressed"
        //         },
        //         files: {
        //             "src/css/API.css": "src/sass/API.scss",
        //             "src/css/Portal.css": "src/sass/Portal.scss"
        //         }
        //     }
        // },

        watch: {
            // css: {
            //     files: "**/*.scss",
            //     tasks: ["sass:dist"]
            // },
            js: {
                files: "**/*.js",
                tasks: ["requirejs:compile"]
            }
        },

        // clean: {
        //     // build: [".buildjs", "cordova/www"],
        //     build: ["build", ".buildjs"],
        //     bower: ["src/js/components"]
        // },

        // concurrent: {
        //     dev: {
        //         tasks: ['watch:css'],
        //         options: {
        //             logConcurrentOutput: true
        //         }
        //     },
        //     prod: {
        //         tasks: ['watch:css', 'watch:js'],
        //         options: {
        //             logConcurrentOutput: true
        //         }
        //     }
        // },

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
    // grunt.loadNpmTasks("grunt-contrib-sass");
    // grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    // grunt.loadNpmTasks('grunt-contrib-clean');

    // grunt.registerTask("build", ["clean:build", "sass:dist", "requirejs:compile", "copy:build"]);

    // grunt.registerTask("watcher", ["concurrent:dev"]);
    // grunt.registerTask("watcher:prod", ["concurrent:prod"]);

    grunt.registerTask("default", ["requirejs:compile"]);

};
