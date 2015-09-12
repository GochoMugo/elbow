/*
 * Command-line interface
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */

/* eslint-disable no-process-exit */

// built-in modules
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _path = require("path");

// npm-installed modules

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _cliOutput = require("cli-output");

// own modules

var _cliOutput2 = _interopRequireDefault(_cliOutput);

var _index = require("./index");

var _index2 = _interopRequireDefault(_index);

var _packageJson = require("../package.json");

var _packageJson2 = _interopRequireDefault(_packageJson);

_commander2["default"].version(_packageJson2["default"].version).option("-l, --list [schema-dir]", "list schemas").parse(process.argv);

// listing schemas
if (_commander2["default"].list) {
  var dirpath = _commander2["default"].list;

  // default to $PWD/schema if no path is provided
  if (dirpath === true) {
    dirpath = _path2["default"].join(process.cwd(), "schema");
  }

  // listing schemas
  _index2["default"].schemas(dirpath, function (err, schemas) {
    if (err) {
      _cliOutput2["default"].error("error listing schemas: " + err);
      return process.exit(1);
    }

    var keys = _lodash2["default"].keys(schemas);

    // if no schema was found
    if (keys.length === 0) {
      return _cliOutput2["default"].error("no schema found");
    }

    _cliOutput2["default"].success("listing schemas:\n");
    schemas.forEach(function (schema) {
      console.log(schema.methods + " " + schema.endpoint + " (" + schema.description + ") -> " + schema.filepath);
    });
  });
}