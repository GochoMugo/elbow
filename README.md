# elbow

> An **easy** way to test REST API responses with Mocha

[![Version](https://img.shields.io/npm/v/elbow.svg)](https://www.npmjs.com/package/elbow)
 [![Supported Node.js Versions](https://img.shields.io/node/v/elbow.svg)](https://www.npmjs.com/package/elbow)
 [![Build Status](https://travis-ci.org/GochoMugo/elbow.svg?branch=master)](https://travis-ci.org/GochoMugo/elbow)
 [![Coverage Status](https://coveralls.io/repos/GochoMugo/elbow/badge.svg?branch=master)](https://coveralls.io/r/GochoMugo/elbow?branch=master)
 [![Dependency Status](https://gemnasium.com/GochoMugo/elbow.svg)](https://gemnasium.com/GochoMugo/elbow)

elbow = [mocha](http://mochajs.org/) + [superagent](http://visionmedia.github.io/superagent/) + [ajv](https://github.com/epoberezkin/ajv)


## what makes it easy?

1. Utilizes the power of [JSON Schema](http://json-schema.org/) (see [also](http://spacetelescope.github.io/understanding-json-schema/UnderstandingJSONSchema.pdf)).
1. You do not need to write code for interacting with the API.
1. Your schemas define what endpoints they are tested against, along with
  parameters, such as request headers and body.
1. Offers a gentle learning curve.


## usage:

A sample test script:

```js
const elbow = require("elbow");

describe("testing Http Responses", function() {
  elbow.run(it, "http://localhost:9090/", `${__dirname}/../schema`, {
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
const elbow = require("elbow");
```

### elbow.run(it, baseUrl, schemaDir [, options])

Runs your tests.

* `it` (Function): `it` provided by Mocha.
* `baseUrl` (String): base URL of the server. This is used to resolve the relative urls (endpoints).
* `schemaDir` (String): path to the directory holding your schemas.
* `options` (Object): test configurations <a name="options"></a>
  * `options.timeout` (Integer): test-specific timeout
  * `options.label` (Function):
    * returns a custom `it` label
    * signature: `function(method, schema)`
  * `options.headers` (Object): headers sent on each request. Merged with headers found in schema.
  * `options.query` (Object): query parameters sent on each request. Merged with query found in schema.
  * `options.body` (Object): body parameters sent on each request. Merged with body found in schema.
  * `options.vars` (Object): variables used in [variable expansions](#vars-expansion).
  * `options.before` (Function): `before` by Mocha; Makes elbow look for **setup** schemas
  in the `setup` directory in `schemaDir`. These schemas are run before any test cases.
  * `options.beforeBaseUrl` (String): base URL used in setup. Otherwise `baseUrl` is used.
  * `options.extensions` (String[]): extensions of schema files to be used. Defaults to `["json"]`. See [using other file formats](#file-formats).


### elbow.schemas(schemaDir, callback)

Loads your schemas.

* `schemaDir` (String): path to the directory holding your schemas.
* `callback` (Function):
  * signature: `callback(err, schemas)`
  * `schemas` (Array): array holding your schemas


## schemas:

Schemas, as defined in its [specification](http://json-schema.org/), are valid JSON documents.

All the schemas should be placed in a single directory. They should have the extension `.json`.

<a name="schema"></a>
A sample schema file would look like:

```json
{
  "$schema": "http://json-schema.org/schema#",

  "endpoint": "/test/endpoint",
  "description": "test endpoint",
  "methods": ["post"],
  "params": {
    "key": "value"
  },
  "headers": {
    "Authorization": "${OAUTH_TOKEN}"
  },
  "query": {
    "key": "value"
  },
  "body": {
    "key": "value"
  },

  "status": 200,
  "type": "object",
  "properties": {
    "ok": {
      "type": "boolean"
    }
  },
  "required": ["ok"],

  "export": {
    "var_name": "ok"
  }
}
```

Required key-value pairs include:

* `endpoint` (String): endpoint to test. This will be resolved to an absolute url using the base url. e.g. `/endpoint`
* `description` (String): describes the significance of the http response. e.g. `"creating a new resource object"`
* `methods` (Array): all the http methods to use to test the endpoint
  * possible values: `"get"`, `"post"`, `"put"`, `"delete"`

Optional key-value pairs include:

* `headers` (Object): headers to send in request
* `query` (Object): query parameters to send in request
* `body` (Object): body to send in request. Only applied if method is `"post"` or `"put"`
* `status` (Number): response status code. e.g. `201`
* `export` (Object): variables to be exported. See [exporting variables](#vars-export)
* `params` (Object): **DEPRECATED: Use `headers`, `query` or `body` instead!**
  * parameters to pass to endpoint. e.g. `{ "query": "name" }`

<a name="vars-expansion"></a>
##### variable expansion:

The `endpoint`, `headers`, `query` and `body` parameters can contain variables, in the
form, `${VARIABLE_NAME}`, that will be expanded as necessary. The value
is determined from `options.vars` (see [above](#options)) or from the process environment.
If the value could **not** be determined, the variable is **not** expanded
i.e. is ignored.


<a name="vars-export"></a>
##### variable exports:

The `export` parameter is used to export variables from the test case making
them available for any following test cases. The key-value pairs under
`export` are such that: they key defines the name of the variable and
the value defines the **path in the response body** to the property to
be used. For example, if response body was:

```json
{
  "setup": {
    "token": "am.a.token"
  }
}
```

and the `export` parameter was:

```json
{
  "export": {
    "setup_token": "setup.token"
  }
}
```

would export the variable `${setup_token}` with value `"am.a.token"` at
path `setup.token`. Any following schemas [sic: read test cases] can access
`${setup_token}` and it'll resolve successfully.
See [lodash.get](https://lodash.com/docs/#get)/[lodash.set](https://lodash.com/docs/#set).


<a name="file-formats"></a>
##### using other file formats:

You can use other file formats such as [JSON5](http://json5.org/) and [YAML](http://yaml.org/).
Before using `describe()` you need to install the `require` extension
for your file format. For example,

```js
const fs = require("fs");
const yaml = require("js-yaml");
const elbow = require("elbow");

require.extensions[".yml"] = function(mod, filename) {
  mod.exports = yaml.safeLoad(fs.readFileSync(filename, "utf8"));
};

describe("using yaml", function() {
  elbow.run(it, "http://localhost:8080", path.join(__dirname, "example"), {
    extensions: ["yml"],
  });
});
```

You can now write your schema files in YAML e.g. `example.yml`.


---

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

1. **Synchronous** file operations are used internally to ensure test cases are executed in correct order by mocha.


## license:

**The MIT License (MIT)**

Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
