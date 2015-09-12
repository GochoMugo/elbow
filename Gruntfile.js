/**
 * Run script for Grunt, task runner
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */

// npm-installed modules
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _loadGruntTasks = require("load-grunt-tasks");

var _loadGruntTasks2 = _interopRequireDefault(_loadGruntTasks);

exports["default"] = function (grunt) {
  (0, _loadGruntTasks2["default"])(grunt);

  grunt.initConfig({
    eslint: {
      src: ["src/**/*.js"]
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          quiet: false,
          clearRequireCache: false
        },
        src: ["test/test.*.js"]
      }
    }
  });

  grunt.registerTask("test", ["eslint", "mochaTest"]);
};

module.exports = exports["default"];