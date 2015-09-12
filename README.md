
# elbow

> An **easy** way to test REST API responses with Mocha

[![Version](https://img.shields.io/npm/v/elbow.svg)](https://www.npmjs.com/package/elbow) [![Build Status](https://travis-ci.org/GochoMugo/elbow.svg?branch=master)](https://travis-ci.org/GochoMugo/elbow) [![Coverage Status](https://coveralls.io/repos/GochoMugo/elbow/badge.svg?branch=master)](https://coveralls.io/r/GochoMugo/elbow?branch=master) [![Dependency Status](https://gemnasium.com/GochoMugo/elbow.svg)](https://gemnasium.com/GochoMugo/elbow)

elbow = [mocha](http://mochajs.org/) + [superagent](http://visionmedia.github.io/superagent/) + [jayschema](https://github.com/natesilva/jayschema) + [awesomeness](https://www.dropbox.com/s/flwsp52rm1r9xrw/awesomeness.jpg?dl=0)


## what makes it easy?

1. you only write one, short test file with one test suite
1. your schemas define what endpoints they are tested against
1. it fits just right in your work flow


## usage:

A sample test script:

```js
var elbow = require("elbow");

describe("testing Http Responses", function() {
  elbow.run(it, "http://localhost:9090/", __dirname + "/../schema", {
    timeout: 5000,
  });
});
```

See a [sample schema](#schema).

See a [sample test output](#output).


## installation:

```bash
⇒ npm install elbow --save-dev
```


## API:

```js
var elbow = require("elbow");
```

### elbow.run(it, baseUrl, schemaDir [, options])

Runs your tests.

* `it` (Function): it provided by Mocha.
* `baseUrl` (String): base url of the server. This is used to resolve the relative urls (endpoints).
* `schemaDir` (String): path to the directory holding your schemas.
* `options` (Object): test configurations
  * `options.timeout` (Integer): test-specific timeout


### elbow.schemas(schemaDir, callback)

Loads your schemas.

* `schemaDir` (String): path to the directory holding your schemas.
* `callback` (Function):
  * signature: `callback(err, schemas)`
  * `schemas` (Array): array holding your schemas


## schemas:

Schemas, as defined in its [specification](http://spacetelescope.github.io/understanding-json-schema/UnderstandingJSONSchema.pdf), are valid JSON documents.

All the schemas should be placed in a single directory. They should have the extension `.json`.

<a name="schema"></a>
A sample schema file would look like:

```json
{
  "$schema": "http://json-schema.org/schema#",

  "endpoint": "/transactions/transfers/charges",
  "description": "transfer charges",
  "methods": ["get", "post"],
  "params": {
    "to": "registered",
    "amount": 5000
  },

  "type": "object",
  "properties": {
    "charge": {
      "type": "string"
    }
  },
  "required": ["charge"]
}
```

Required key-value pairs include:

* `endpoint` (String): endpoint to test. This will be resolved to an absolute url using a base url.
* `description` (String): describes the significance of the http response.
* `methods` (Array): all the http methods to use to test the endpoint
  * possible values: `"get"`, `"post"`, `"put"`, `"delete"`
* `params` (Object): parameters to pass to endpoint.

The rest of the document will be used *as is* in validation.

The test cases are created in the order of:

1. filename of the schema files. e.g. `01-get.json` is used before `02-get.json`
1. indices of `"methods"` in the schema. e.g. with `["post", "get"]`, `"post"` is used before `"get"`

This allows you to use a sequence in your tests, without having to use any `beforeEach`, any code, etc...


## test output:

<a name="output"></a>
Sample Test Output:

```bash
  ✓ GET /params (testing the sending of params) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/params.json] (60ms)
  ✓ POST /params (testing the sending of params) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/params.json]
  ✓ PUT /params (testing the sending of params) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/params.json]
  ✓ DELETE /params (testing the sending of params) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/params.json]
  ✓ GET /simple (testing the response body only) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/simple.json]
  ✓ POST /simple (testing the response body only) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/simple.json]
  ✓ PUT /simple (testing the response body only) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/simple.json]
  ✓ DELETE /simple (testing the response body only) [/home/gocho/Repos/GochoMugo/github/elbow/test/schema/simple.json]
```

The **method** and **endpoint** is shown for each test case. The **description** of the schema is shown between `(` and `)`. The **absolute filepath** of the schema file used in the test case is shown between `[` and `]`.


## terminal usage:

Elbow is also available from your terminal.

If installed globally, the command `elbow` will be readily available. Otherwise, elbow will be available at `./node_modules/.bin/elbow`.


### listing your schemas:

To list your schemas with the respective descriptions.

```bash
⇒ elbow --list [absolutePathToSchemaDir]
```


### notes:

1. synchronous file operations are used internally to ensure test cases are executed in correct order by mocha.


## license:

**The MIT License (MIT)**

Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
