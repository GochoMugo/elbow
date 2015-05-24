
# elbow

> An **easy** way to test REST API responses with Mocha

[![Version](https://img.shields.io/npm/v/elbow.svg)](https://www.npmjs.com/package/elbow) [![Build Status](https://travis-ci.org/GochoMugo/elbow.svg?branch=master)](https://travis-ci.org/GochoMugo/elbow) [![Coverage Status](https://coveralls.io/repos/GochoMugo/elbow/badge.svg)](https://coveralls.io/r/GochoMugo/elbow)

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
  elbow.run(it, "http://localhost:9090/", __dirname + "/../schema");
});
```

See a [sample schema](#schema).


## installation:

```bash
⇒ npm install elbow --save-dev
```


## API:

```js
var elbow = require("elbow");
```

### elbow.run(it, baseUrl, schemaDir)

Runs your tests.

* `it` (Function): it provided by Mocha.
* `baseUrl` (String): base url of the server. This is used to resolve the relative urls (endpoints).
* `schemaDir` (String): path to the directory holding your schemas.


### elbow.schemas(schemaDir, callback)

Loads your schemas.

* `schemaDir` (String): path to the directory holding your schemas.
* `callback` (Function):
  * signature: `callback(err, schemas)`
  * `schemas`: object holding your schemas whose keys are the various endpoints


## schemas

All schemas should be placed in a single directory. They should be valid JSON documents with the extension `.json`.

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
* `description` (String): describes the significance of the Http response.
* `methods` (Array): all the Http methods to use to test the endpoint
* `params` (Object): parameters to pass to endpoint

The rest of the documents will be used as is in validation.


## terminal usage:

Elbow is also available from your terminal.

If installed globally, the command `elbow` will be readily available. Otherwise, elbow will be available at `./node_modules/.bin/elbow`.


### listing your schemas:

To list your schemas with the respective descriptions.

```bash
⇒ elbow --list [pathToSchemaDir]
```


## license:

**The MIT License (MIT)**

Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>

