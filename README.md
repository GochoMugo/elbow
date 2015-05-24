
# elbow

> An easy way to test REST API responses with Mocha

elbow = [mocha](http://mochajs.org/) + [supertest](http://visionmedia.github.io/superagent/) + [jayschema](https://github.com/natesilva/jayschema) + [awesomeness](https://www.dropbox.com/s/flwsp52rm1r9xrw/awesomeness.jpg?dl=0)


## usage:

In a test script:

```js
var elbow = require("elbow");

describe("testing Http Responses", function() {
  elbow.run("http://localhost:9090/", __dirname + "/../schemas");
});
```


## installation:

```bash
⇒ npm install elbow --save-dev
```


## schemas

All schemas should be placed in a single directory. They should be valid JSON documents with the extension `.json`.

A sample schema file would look like:

```json
{
  "$schema": "http://json-schema.org/schema#",

  "endpoint": "/transactions/transfers/charges",
  "description": "transfer charges",
  "methods": ["get"],
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

* `endpoint` (String): endpoint to test. This will be resolved to an absolute url using a base url.
* `description` (String): describes the significance of the Http response.
* `methods` (Array): all the Http methods to use to test the endpoint
* `params` (Object): parameters to pass to endpoint

The rest of the documents will be used as is in validation.


## license:

**The MIT License (MIT)**

Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>

