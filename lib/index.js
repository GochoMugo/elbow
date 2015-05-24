/*
* The Elbow
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


"use strict";


// built-in modules
var fs = require("fs");
var path = require("path");
var url = require("url");


// npm-installed modules
var _ = require("lodash");
var debug = require("debug")("elbow:main");
var Jayschema = require("jayschema");
var request = require("superagent");
var should = require("should");


// module variables
var validator = new Jayschema(Jayschema.loaders.http);


/*
* Loads all the Schemas into memory
* @param <schemaDir> - {String} path to directory holding schemas
* @param <callback> - {Function} callback(err, schemas)
*/
function requireAll(schemaDir, callback) {
  debug("loading schemas");
  var all = { };
  fs.readdir(schemaDir, function(err, files) {
    if (err) {
      return callback(err);
    }
    for (var index in files) {
      if (path.extname(files[index]) === ".json") {
        var dotIndex, filename, mod;
        dotIndex = files[index].lastIndexOf(".");
        filename = files[index].substring(0, dotIndex);
        try {
          mod = require(path.join(schemaDir, filename));
        } catch (err) {
          return callback(err);
        }
        all[mod.endpoint] = mod;
        all[mod.endpoint].filename = filename;
      }
    }
    return callback(null, all);
  });
}


/*
* Determine name of function to use (on supertest) from the method
* @param <method> - {String} http method e.g. "get", "post"
* @return {String} function name e.g. "send"
*/
function getParamFuncName(method) {
  method = method.toLowerCase();
  switch (method) {
  case "get":
  case "head":
    return "query";
  case "post":
  case "put":
    return "send";
  }
}


/*
* Create test case label
* @param <method> - {String} method used in test case e.g. "get"
* @param <schema> - {Object} schema used in test case
* @return {String} label used for test case
*/
function createTestCaseLabel(method, schema) {
  return method.toUpperCase() + " " +
    (schema.endpoint || "") + " " +
    "(" + schema.description + ") " +
    "[" + schema.filename + "]";
}


/*
* Validate a Http response using schema
* @param <schema> - {Object} schema used to validate against
* @param <response> - {Any} http response
* @param <done> - {Function} called once validation is completed
*/
function validateResponse(schema, response, done) {
  debug("validating response for %s", schema.endpoint);
  validator.validate(response, schema, function(errs) {
    should(errs).not.be.ok;
    return done();
  });
}


/*
* Make a Http request with objective of validating its response
* @param <baseUrl> - {String} base url e.g. "http://localhost:9090/"
* @param <method> - {String} http method to use for request e.g. "get"
* @param <schema> - {Object} schema used to validate response
* @param <done> - {Function} function called once request is completed
*/
function makeRequest(baseUrl, method, schema, done) {
  debug("making %s request to %s", method.toUpperCase(),
    schema.endpoint);
  request
    [method](url.resolve(baseUrl, schema.endpoint))
    [getParamFuncName(method)](schema.params || { })
    .end(function(err, response) {
      should(err).not.be.ok;
      return validateResponse(schema, response.body, done);
    });
}


/*
* Create a test case (using "it" from mocha)
* @param <it> - {Function} it from mocha, for test cases
* @param <baseUrl> - {String} base url e.g. "http://localhost:9090/"
* @param <method> - {String} http method to use for request e.g. "get"
* @param <schema> - {Object} schema used to validate response
*/
function createTestCase(it, baseUrl, method, schema) {
  debug("creating test case for %s %s", method.toUpperCase(),
    schema.endpoint);
  it(createTestCaseLabel(method, schema), function(done) {
    return makeRequest(baseUrl, method, schema, done);
  });
}


/*
* Create test cases (to be used in describe)
* @param <it> - {Function} it from mocha, for test cases
* @param <baseUrl> - {String} base url e.g. "http://localhost:9090/"
* @param <schema> - {Object} schema used to validate response
*/
function createTestCases(it, baseUrl, schema) {
  debug("creating tests cases for %s", schema.endpoint);
  // each method in a schema
  for (var index in schema.methods) {
    createTestCase(it, baseUrl, schema.methods[index], schema);
  }
  return;
}


/*
* Create test suite
* @param <it> - {Function} it from mocha, for test cases
* @param <baseUrl> - {String} base url e.g. "http://localhost:9090/"
* @param <string> - {String} directory containing schemas
*/
function createTestSuite(it, baseUrl, schemaDir) {
  debug("creating test suite for schemas in %s", schemaDir);
  return requireAll(schemaDir, function(err, schemas) {
    should(err).not.be.ok;
    var keys = _.keys(schemas);
    keys.sort();
    // each schema
    for (var index in keys) {
      var key = keys[index];
      var schema = schemas[key];
      createTestCases(it, baseUrl, schema);
    }
  });
}


// Exporting
exports.schemas = requireAll;
exports.run = createTestSuite;

