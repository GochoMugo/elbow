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
var Jayschema = require("jayschema");
var request = require("supertest");
var should = require("should");


// module variables
var validator = new Jayschema(Jayschema.loaders.http);


/*
* Loads all the Schemas into memory
* @param <schemaDir> - {String} path to directory holding schemas
* @param <callback> - {Function} callback(err, schemas)
*/
function requireAll(schemaDir, callback) {
  var all = { };
  var files = fs.readdir(schemaDir, function(err, files) {
    if (err) {
      return callback(err);
    }
    for (var index in files) {
      if (path.extname(files[index] === ".json")) {
        var dotIndex, filename, mod;
        dotIndex = files[index].lastIndexOf(".");
        filename = files[index].substring(0, dotIndex);
        mod = require(path.join(schemaDir, filename));
        all[mod.endpoint] = mod;
        all[mod.endpoint] = filename;
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
    (schema.endpoint || "") +
    "(" + schema.description + ")" +
    "[" + schema.filename + "]";
}


/*
* Validate a Http response using schema
* @param <schema> - {Object} schema used to validate against
* @param <response> - {Any} http response
* @param <done> - {Function} called once validation is completed
*/
function validateResponse(schema, response, done) {
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
  request
    [method](url.resolve(baseUrl, schema.endpoint))
    [getParamFuncName(method)](schema.params)
    .end(function(err, response) {
      should(err).not.be.ok;
      return validateResponse(schema, response, done);
    });
}


/*
* Create a test case (using "it" from mocha)
* @param <baseUrl> - {String} base url e.g. "http://localhost:9090/"
* @param <method> - {String} http method to use for request e.g. "get"
* @param <schema> - {Object} schema used to validate response
*/
function createTestCase(baseUrl, method, schema) {
  it(createTestCaseLabel(method, schema), function(done) {
    return makeRequest(baseUrl, method, schema, done);
  });
}


/*
* Create test cases (to be used in describe)
* @param <baseUrl> - {String} base url e.g. "http://localhost:9090/"
* @param <schema> - {Object} schema used to validate response
*/
function createTestCases(baseUrl, schema) {
  return function() {
    // each method in a schema
    for (var index in schema.methods) {
      createTestCase(baseUrl, method);
    }
    return;
  };
}


/*
* Create test suite
* @param <baseUrl> - {String} base url e.g. "http://localhost:9090/"
* @param <string> - {String} directory containing schemas
*/
function createTestSuite(baseUrl, schemaDir) {
  return requireAll(schemaDir, function(err, schemas) {
    var keys = _.keys(schemas);
    keys.sort();
    // each schema
    for (var index in keys) {
      var key = keys[index];
      var schema = schemas[key];
      createTestCases(baseUrl, schema);
    }
  });
}


// Exporting
exports.schemas = requireAll;
exports.run = createTestSuite;

