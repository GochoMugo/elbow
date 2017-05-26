/*
 * The Elbow
 *
 * The MIT License (MIT)
 * Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
 */


export default {
  schemas: requireAll,
  run: createTestSuite,
};


// built-in modules
import fs from "fs";
import path from "path";
import url from "url";


// installed modules
import _ from "lodash";
import Debug from "debug";
import Jayschema from "jayschema";
import request from "superagent";
import should from "should";


// module variables
const debug = Debug("elbow:main");
const validator = new Jayschema(Jayschema.loaders.http);


/*
 * Loads all the Schemas into memory.
 *
 * @param  {String} schemaDir - path to directory holding schemas
 * @param  {Function} callback - callback(err, schemas)
 */
function requireAll(schemaDir, callback) {
  debug("loading schemas");

  let files;
  try {
    files = fs.readdirSync(schemaDir);
  } catch(errReaddir) {
    return callback(errReaddir);
  }

  let schemas = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];

    // if it is NOT a json file, ignore it
    if (path.extname(file) !== ".json") {
      continue;
    }

    const abspath = path.join(schemaDir, file);
    let schema;

    // try load the schema! If it fails, stop immediately
    try {
      schema = require(abspath);
    } catch (errRequire) {
      return callback(errRequire);
    }

    schema.filepath = abspath;
    schemas.push(schema);
  }

  return callback(null, schemas);
}


/*
 * Determine name of method function to use (on superagent) from
 * the method.
 * This handles mapping the methods we allow in our schemas
 * to actual functions on the superagent object.
 *
 * @private
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
 * Determine name of param-sending function to use (on superagent) from
 * the method in the schema.
 * This handles choosing how the parameters are sent using the
 * superagent instance.
 *
 * @private
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
 * Create test case label that is shown in the Mocha UI.
 *
 * @private
 * @param  {String} method - method used in test case e.g. "get"
 * @param  {Object} schema - schema used in test case
 * @return {String} label used for test case
 */
function createTestCaseLabel(method, schema) {
  return [
    method.toUpperCase(),
    schema.endpoint,
    "(" + schema.description + ")",
    "[" + schema.filepath + "]",
  ].join(" ");
}


/*
 * Validate a Http response using schema.
 * This handles the actual JSON schema validation.
 *
 * @private
 * @param  {Object} schema - schema used to validate against
 * @param  {*} response - http response
 * @param  {Function} done - called once validation is completed
 *
 * @TODO Swap validators: 'jayschema' with 'ajv'
 * @TODO Remove our "extensions" i.e. any custom properties in the
 *       schema that we have added for the purpose of the elbow utility.
 */
function validateResponse(schema, response, done) {
  debug(`validating response for ${schema.endpoint}`);
  // testing status code
  if (schema.status) {
    should(response.status).eql(schema.status);
  }
  return validator.validate(response.body, schema, function(errors) {
    should(errors).not.be.ok();
    return done();
  });
}


/*
 * Make a HTTP request against the remote server and validate the
 * response.
 *
 * @private
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {String} method - http method to use for request e.g. "get"
 * @param  {Object} schema - schema used to validate response
 * @param  {Object} options - test configurations
 * @param  {Function} done - function called once request is completed
 */
function makeRequest(baseUrl, method, schema, options, done) {
  debug(`making ${method.toUpperCase()} request to ${schema.endpoint}`);
  const endpoint = url.resolve(baseUrl + "/", _.trimStart(schema.endpoint, "/"));
  const headers = Object.assign({}, options.headers, schema.headers);
  const query = Object.assign({}, options.query, schema.query);
  const body = Object.assign({}, options.body, schema.body);

  let req = request[getMethodFuncName(method)](endpoint);

  if (schema.params) {
    req = req[getParamFuncName(method)](schema.params);
  }
  if (Object.keys(headers).length) {
    for (let key in headers) {
      req = req.set(key, headers[key]);
    }
  }
  if (Object.keys(query).length) {
    req = req.query(query);
  }
  if (Object.keys(body).length) {
    req = req.send(body);
  }

  return req.end(function(error, response) {
      // catch network errors, etc.
      if (!response) {
        should(error).not.be.ok();
      }
      should(response).be.ok();
      return validateResponse(schema, response, done);
    });
}


/*
 * Create a test case (using "it" from mocha).
 *
 * @private
 * @param  {Function} it - it from mocha, for test cases
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {String} method - http method to use for request e.g. "get"
 * @param  {Object} schema - schema used to validate response
 * @param  {Object} options - test configurations
 */
function createTestCase(it, baseUrl, method, schema, options) {
  debug(`creating test case for ${method.toUpperCase()} ${schema.endpoint}`);
  const label = typeof options.label === "function" ?
    options.label(method, schema) :
    createTestCaseLabel(method, schema) ;
  it(label, function(done) {
    // allow setting timeouts
    if (options.timeout) {
      this.timeout(options.timeout);
    }
    makeRequest(baseUrl, method, schema, options, done);
  });
}


/*
 * Create test cases (using "describe" from mocha).
 *
 * @param  {Function} it - it from mocha, for test cases
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {Object} schema - schema used to validate response
 * @param  {Object} options - test configurations
 */
function createTestCases(it, baseUrl, schema, options) {
  debug(`creating tests cases for ${schema.endpoint}`);

  // each method in a schema
  return schema.methods.forEach(function(method) {
    return createTestCase(it, baseUrl, method, schema, options);
  });
}


/*
 * Create test suite
 *
 * @param  {Function} it - it from mocha, for test cases
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {String} string - directory containing schemas
 * @param  {Object} [options] - test configurations
 * @param  {Integer} [options.timeout] - timeout used in test cases
 * @param  {Function} [options.label] - returns a `it` label
 * @param  {Object} [options.headers] - headers sent on each request
 * @param  {Object} [options.query] - query parameters sent on each request
 * @param  {Object} [options.body] - body sent on each request
 */
function createTestSuite(it, baseUrl, schemaDir, options={}) {
  debug(`creating test suite for schemas in ${schemaDir}`);
  return requireAll(schemaDir, function(error, schemas) {
    should(error).not.be.ok();

    // each schema
    return schemas.forEach(function(schema) {
      return createTestCases(it, baseUrl, schema, options);
    });
  });
}
