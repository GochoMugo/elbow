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
import Ajv from "ajv";
import Debug from "debug";
import depd from "depd";
import request from "superagent";
import should from "should";


// module variables
const debug = Debug("elbow:main");
const deprecate = depd("elbow");
const validator = new Ajv({ loadSchema });


/**
 * Loads schema from remote server using a HTTP URI.
 *
 * @private
 * @param  {String} uri - HTTP URI to schema
 * @return {Promise}
 * @see https://github.com/epoberezkin/ajv#asynchronous-schema-compilation
 */
function loadSchema(uri) {
  return new Promise(function(resolve, reject) {
    request.get(uri).end(function(error, response) {
      if (error || !response.ok) {
        error = error || new Error(response.body);
        debug("error fetching remote schema:", error);
        return reject(error);
      }
      return resolve(response.body);
    });
  });
}


/**
 * Loads all the Schemas into memory.
 *
 * @param  {String} schemaDir - path to directory holding schemas
 * @param  {Object} [options]
 * @param  {String[]} [options.extensions=["json"]] Extension of schema files
 * @param  {Function} callback - callback(err, schemas)
 */
function requireAll(schemaDir, options, callback) {
  debug("loading schemas");
  if (!callback) {
    callback = options;
    options = {};
  }
  const opts = _.assign({
    extensions: ["json"],
  }, options);

  let files;
  try {
    files = fs.readdirSync(schemaDir);
  } catch(errReaddir) {
    return callback(errReaddir);
  }

  let schemas = [];

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const ext = path.extname(file).slice(1);

    if (opts.extensions.indexOf(ext) === -1) {
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


/**
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


/**
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


/**
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


/**
 * Expand variables, using variables from the `options` object,
 * or process environment.
 * Modifies the passed object in place.
 *
 * @private
 * @param  {String|Object} target - object with parameters
 * @param  {Object} options - test configurations
 * @return {String|Object}
 */
function expandVars(target, options) {
  const vars = options.vars || {};
  const regexp = /\$\{(\w+)\}/g;

  if (typeof target === "string") {
    return _expand(target);
  }
  for (let key in target) {
    target[key] = _expand(target[key]);
  }
  return target;

  function _expand(val) {
    let expanded = val;
    let match;

    while (match = regexp.exec(val)) {
      const varname = match[1];
      const varval = vars[varname] || process.env[varname];
      if (!varval) {
        debug(`could not expand variable \${${varname}}`);
        continue;
      }
      expanded = expanded.replace(`\${${varname}}`, varval);
    }
    return expanded;
  }
}


/**
 * Validate a Http response using schema.
 * This handles the actual JSON schema validation.
 *
 * @private
 * @param  {Object} schema - schema used to validate against
 * @param  {*} response - http response
 * @param  {Object} options - test configurations
 * @param  {Function} done - called once validation is completed
 *
 * @TODO Remove our "extensions" i.e. any custom properties in the
 *       schema that we have added for the purpose of the elbow utility.
 */
function validateResponse(schema, response, options, done) {
  debug(`validating response for ${schema.endpoint}`);
  // testing status code
  if (schema.status) {
    should(response.status).eql(schema.status);
  }
  return validator.compileAsync(schema).then((validate) => {
    const valid = validate(response.body);
    if (!valid) {
      const errors = validate.errors;
      should(errors).not.be.ok();
      return done(errors);
    }
    if (schema.export) {
      const body = response.body;
      options.vars = options.vars || {};
      for (let dest in schema.export) {
        const propPath = schema.export[dest];
        _.set(options.vars, dest, _.get(body, propPath));
      }
    }
    return done(null, response);
  }).catch(done);
}


/**
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
  const endpoint = expandVars(schema.endpoint, options);
  const apiPath = url.resolve(baseUrl + "/", _.trimStart(endpoint, "/"));
  const headers = Object.assign({}, options.headers, schema.headers);
  const query = Object.assign({}, options.query, schema.query);
  const body = Object.assign({}, options.body, schema.body);

  let req = request[getMethodFuncName(method)](apiPath);

  // NOTE/deprecate: params
  if (schema.params) {
    deprecate("'params' property/extension in schema is deprecated. Use 'headers', 'query' or 'body' instead.");
    req = req[getParamFuncName(method)](schema.params);
  }
  if (Object.keys(headers).length) {
    expandVars(headers, options);
    for (let key in headers) {
      req = req.set(key, headers[key]);
    }
  }
  if (Object.keys(query).length) {
    expandVars(query, options);
    req = req.query(query);
  }
  if (Object.keys(body).length) {
    expandVars(body, options);
    req = req.send(body);
  }

  return req.end(function(error, response) {
    // catch network errors, etc.
    if (!response) {
      should(error).not.be.ok();
    }
    should(response).be.ok();
    should(response.body).be.ok();
    return validateResponse(schema, response, options, done);
  });
}


/**
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


/**
 * Create test cases.
 *
 * @private
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


/**
 * Create test setup hook (using "before" from mocha).
 *
 * @private
 * @param  {Function} before - 'before' from mocha, for setup hook
 * @param  {String} baseUrl - base URL e.g. "http://localhost:9090/"
 * @param  {String} schemaDir - directory containing schemas
 * @param  {Object} options - test configurations
 */
function createSetupHook(before, baseUrl, schemaDir, options) {
  before("setup", function(done) {
    debug("running test setup");
    if (options.timeout) {
      this.timeout(options.timeout);
    }

    const setupPath = path.join(schemaDir, "setup");
    requireAll(setupPath, options, function(error, schemas) {
      if (error) return done(error);
      let promise = Promise.resolve();
      schemas.forEach(function(schema) {
        promise = promise.then(function() { return _setup(schema); });
      });
      promise.then(done).catch(done);
    });
  });
  function _setup(schema) {
    return new Promise(function(resolve, reject) {
      const method = schema.methods[0];
      makeRequest(baseUrl, method, schema, options, function(error, response) {
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }
}


/**
 * Create test suite
 *
 * @param  {Function} it - it from mocha, for test cases
 * @param  {String} baseUrl - base url e.g. "http://localhost:9090/"
 * @param  {String} schemaDir - directory containing schemas
 * @param  {Object} [options] - test configurations
 * @param  {Integer} [options.timeout] - timeout used in test cases
 * @param  {Function} [options.label] - returns a `it` label
 * @param  {Object} [options.headers] - headers sent on each request
 * @param  {Object} [options.query] - query parameters sent on each request
 * @param  {Object} [options.body] - body sent on each request
 * @param  {Object} [options.vars] - variables used in expansion
 * @param  {Function} [options.before] - 'before' from mocha, for setup
 * @param  {String} [options.beforeBaseUrl] - base url, for setup
 * @param  {String[]} [options.extensions] - extensions of schemas
 */
function createTestSuite(it, baseUrl, schemaDir, options={}) {
  if (options.before) {
    debug(`creating test setup for schemas in ${schemaDir}`);
    createSetupHook(options.before, options.beforeBaseUrl || baseUrl, schemaDir, options);
  }
  debug(`creating test suite for schemas in ${schemaDir}`);
  return requireAll(schemaDir, options, function(error, schemas) {
    should(error).not.be.ok();

    // each schema
    return schemas.forEach(function(schema) {
      return createTestCases(it, baseUrl, schema, options);
    });
  });
}
