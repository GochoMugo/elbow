/**
* Run script for Grunt, task runner
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


exports = module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
        "Gruntfile.js", "lib/**/*.js",
        "test/**/*.js", "benchmark/**/*.js"
      ],
      options: {
        jshintrc: true
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          quiet: false,
          clearRequireCache: false
        },
        src: ["test/**/test.*.js"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-mocha-test");

  grunt.registerTask("test", ["jshint", "mochaTest"]);
};
