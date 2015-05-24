/*
* Command-line interface
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


// built-in modules
var path = require("path");


// npm-installed modules
var _ = require("lodash");
var prog = require("commander");


// own modules
var elbow = require("./index");
var pkg = require("../package.json");


prog
  .version(pkg.version)
  .option("-l, --list [schema-dir]", "list schemas")
  .parse(process.argv);


if (prog.list) {
  var dir = (prog.list !== true) ? prog.list : "schema";
  dir = path.join(process.cwd(), dir);
  elbow.schemas(dir, function(err, schemas) {
    if (err) {
      return console.log("error listing schemas: %j", err);
    }
    var keys = _.keys(schemas);
    if (keys.length === 0) {
      return console.log("no schema found");
    }
    keys.sort();
    console.log("listing schemas:\n");
    for (var index in keys) {
      var key = keys[index];
      console.log("  %s -> %s", key, schemas[key].description);
    }
  });
}

