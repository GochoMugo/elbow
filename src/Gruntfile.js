/**
 * Run script for Grunt, task runner
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


// npm-installed modules
import load from "load-grunt-tasks";


export default function(grunt) {
  load(grunt);

  grunt.initConfig({
    eslint: {
      src: ["src/**/*.js"],
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          quiet: false,
          clearRequireCache: false,
        },
        src: ["test/test.*.js"],
      },
    },
  });

  grunt.registerTask("default", ["test"]);
  grunt.registerTask("test", ["eslint", "mochaTest"]);
}
