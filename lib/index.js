/*
 * The Elbow
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// built-in modules

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _url = require("url");

// npm-installed modules

var _url2 = _interopRequireDefault(_url);

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _jayschema = require("jayschema");

var _jayschema2 = _interopRequireDefault(_jayschema);

var _superagent = require("superagent");

var _superagent2 = _interopRequireDefault(_superagent);

var _should = require("should");

// module variables

var _should2 = _interopRequireDefault(_should);

exports["default"] = {
  schemas: requireAll,
  run: createTestSuite
};
var debug = (0, _debug2["default"])("elbow:main");
var validator = new _jayschema2["default"](_jayschema2["default"].loaders.http);

/*
 * Loads all the Schemas into memory
 *
 * @param  {String} schemaDir - path to directory holding schemas
 * @param  {Function} callback - callback(err, schemas)
 */
function requireAll(schemaDir, callback) {
  debug("loading schemas");

  var schemas = [];

  return _fs2["default"].readdir(schemaDir, function (readdirErr, files) {
    if (readdirErr) {
      return callback(readdirErr);
    }

    files.forEach(function (file) {
      // if it is NOT a json file, ignore it
      if (_path2["default"].extname(file) !== ".json") {
        return null;
      }

      var abspath = _path2["default"].join(schemaDir, file);
      var schema = undefined;

      // try load the schema! If it fails, stop immediately
      try {
        schema = require(abspath);
      } catch (requireErr) {
        return callback(requireErr);
      }

      schema.filepath = abspath;
      schemas.push(schema);
    });

    return callback(null, schemas);
  });
}

/*
 * Determine name of param-sending function to use (on superagent) from the method
 *
 * @param  {String} method - http method e.g. "get", "post"
 * @return {String} function name e.g. "send"
 */
function getMethodFuncName(method) {
  method = method.toLowerCase();
  switch (method) {
    case "delete":
      return "del";
    default:
      return method;
  }
}

/*
 * Determine name of param-sending function to use (on superagent) from the method
 *
 * @param  {String} method - http method e.g. "get", "post"
 * @return {String} function name e.g. "send"
 */
function getParamFuncName(method) {
  method = method.toLowerCase();
  switch (method) {
    case "get":
      return "query";
    case "post":
    case "put":
    case "delete":
      return "send";
  }
}

/*
 * Create test case label
 *
 * @param  {String} method - method used in test case e.g. "get"
 * @param  {Object} schema - schema used in test case
 * @return {String} label used for test case
 */
function createTestCaseLabel(method, schema) {
  return method.toUpperCase() + " " + (schema.endpoint || "") + " (" + schema.description + ") [" + schema.filepath + "]";
}

/*
 * Validate a Http response using schema
 *
 * @param  {Object} schema - schema used to validate against
 * @param  {*} response - http response
 * @param  {Function} done - called once validation is completed
 */
function validateResponse(schema, response, done) {
  debug("validating response for " + schema.endpoint);
  return validator.validate(response, schema, function (errs) {
    (0, _should2["default"])(errs).not.be.ok();
    return done();
  });
}

/*
 * Make a Http request with objective of validating its response
 *
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {String} method - http method to use for request e.g. "get"
 * @param  {Object} schema - schema used to validate response
 * @param  {Function} done - function called once request is completed
 */
function makeRequest(baseUrl, method, schema, done) {
  debug("making " + method.toUpperCase() + " request to " + schema.endpoint);
  return _superagent2["default"][getMethodFuncName(method)](_url2["default"].resolve(baseUrl, schema.endpoint))[getParamFuncName(method)](schema.params || {}).end(function (err, response) {
    (0, _should2["default"])(err).not.be.ok();
    return validateResponse(schema, response.body, done);
  });
}

/*
 * Create a test case (using "it" from mocha)
 *
 * @param  {Function} it - it from mocha, for test cases
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {String} method - http method to use for request e.g. "get"
 * @param  {Object} schema - schema used to validate response
 */
function createTestCase(it, baseUrl, method, schema) {
  debug("creating test case for " + method.toUpperCase() + " " + schema.endpoint);
  it(createTestCaseLabel(method, schema), function (done) {
    return makeRequest(baseUrl, method, schema, done);
  });
}

/*
 * Create test cases (to be used in describe)
 *
 * @param  {Function} it - it from mocha, for test cases
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {Object} schema - schema used to validate response
 */
function createTestCases(it, baseUrl, schema) {
  debug("creating tests cases for " + schema.endpoint);

  // each method in a schema
  return schema.methods.forEach(function (method) {
    return createTestCase(it, baseUrl, method, schema);
  });
}

/*
 * Create test suite
 *
 * @param  {Function} it - it from mocha, for test cases
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {String} string - directory containing schemas
 */
function createTestSuite(it, baseUrl, schemaDir) {
  debug("creating test suite for schemas in " + schemaDir);
  return requireAll(schemaDir, function (err, schemas) {
    (0, _should2["default"])(err).not.be.ok();

    // each schema
    return schemas.forEach(function (schema) {
      return createTestCases(it, baseUrl, schema);
    });
  });
}
module.exports = exports["default"];