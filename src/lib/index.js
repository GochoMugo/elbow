/*
 * The Elbow
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


export default {
  schemas: requireAll,
  run: createTestSuite,
};


// built-in modules
import fs from "fs";
import path from "path";
import url from "url";


// npm-installed modules
import Debug from "debug";
import Jayschema from "jayschema";
import request from "superagent";
import should from "should";


// module variables
const debug = Debug("elbow:main");
const validator = new Jayschema(Jayschema.loaders.http);


/*
 * Loads all the Schemas into memory
 *
 * @param  {String} schemaDir - path to directory holding schemas
 * @param  {Function} callback - callback(err, schemas)
 */
function requireAll(schemaDir, callback) {
  debug("loading schemas");

  let schemas = [];

  return fs.readdir(schemaDir, function(readdirErr, files) {
    if (readdirErr) {
      return callback(readdirErr);
    }

    files.forEach(function(file) {
      // if it is NOT a json file, ignore it
      if (path.extname(file) !== ".json") {
        return null;
      }

      const abspath = path.join(schemaDir, file);
      let schema;

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
  return `${method.toUpperCase()} ${schema.endpoint || ""} (${schema.description}) [${schema.filepath}]`;
}


/*
 * Validate a Http response using schema
 *
 * @param  {Object} schema - schema used to validate against
 * @param  {*} response - http response
 * @param  {Function} done - called once validation is completed
 */
function validateResponse(schema, response, done) {
  debug(`validating response for ${schema.endpoint}`);
  return validator.validate(response, schema, function(errs) {
    should(errs).not.be.ok();
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
  debug(`making ${method.toUpperCase()} request to ${schema.endpoint}`);
  return request
    [getMethodFuncName(method)](url.resolve(baseUrl, schema.endpoint))
    [getParamFuncName(method)](schema.params || { })
    .end(function(err, response) {
      should(err).not.be.ok();
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
  debug(`creating test case for ${method.toUpperCase()} ${schema.endpoint}`);
  it(createTestCaseLabel(method, schema), function(done) {
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
  debug(`creating tests cases for ${schema.endpoint}`);

  // each method in a schema
  return schema.methods.forEach(function(method) {
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
  debug(`creating test suite for schemas in ${schemaDir}`);
  return requireAll(schemaDir, function(err, schemas) {
    should(err).not.be.ok();

    // each schema
    return schemas.forEach(function(schema) {
      return createTestCases(it, baseUrl, schema);
    });
  });
}
