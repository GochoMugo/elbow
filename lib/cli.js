/*
* Command-line interface
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


// npm-installed modules
var _ = require("lodash");
var path = require("path");
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
  var all = elbow.schemas(dir, function(err, schemas) {
    if (err) {
      return console.log("error listing schemas: %j", err);
    }
    var keys = _.keys(all);
    if (keys.length === 0) {
      return console.log("no schema found");
    }
    keys.sort();
    console.log("listing schemas:\n");
    for (var index in keys) {
      console.log("  %s -> %s", keys[index],
        all[keys[index]].description);
    }
  });
}

