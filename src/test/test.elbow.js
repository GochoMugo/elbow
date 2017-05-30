/*
 * Tests against The Elbow
 *
 * The MIT License (MIT)
 * Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
 */


// built-in modules
import path from "path";


// installed modules
import should from "should";


// own modules
import elbow from "..";
import testApp from "./schema/app";
import testSequence from "./sequence/app";
import testBaseurl from "./baseurl/app";
import testOptions from "./options/app";
import testSetup from "./setup/app";


// module variables
let portIndex = 9345;


describe("module", function() {
  it("exports .run function", function() {
    should(elbow.run).be.a.Function();
  });

  it("exports .schemas function", function() {
    should(elbow.schemas).be.a.Function();
  });
});


describe("actual use case", function() {
  // TODO: allow '$ref' to NOT require to be hard-coded!
  const port = 9095;

  before(function(done) {
    process.env.ELBOW_ENV_VAR = "elbow";
    testApp.listen(port, done);
  });
  after(function() {
    delete process.env.ELBOW_ENV_VAR;
  });

  elbow.run(it, `http://localhost:${port}`, path.join(__dirname, "schema"), {
    timeout: 5000,
    vars: {
      "VARIABLE": "VALUE",
      "variable": "value",
    },
  });
});


describe("sequence", function() {
  const port = portIndex++;

  before(function(done) {
    testSequence.listen(port, done);
  });

  elbow.run(it, `http://localhost:${port}`, path.join(__dirname, "sequence"));
});


describe("api baseurl", function() {
  const port = portIndex++;

  before(function(done) {
    testBaseurl.listen(port, done);
  });

  elbow.run(it, `http://localhost:${port}/api`, path.join(__dirname, "baseurl"));
});


describe("options", function() {
  const port = portIndex++;

  before(function(done) {
    testOptions.listen(port, done);
  });

  elbow.run(it, `http://localhost:${port}`, path.join(__dirname, "options"), {
    headers: { "x-key": "value" },
    query: { key: "value" },
    body: { key: "value" },
  });
});


describe("setup", function() {
  const port = portIndex++;

  before(function(done) {
    testSetup.listen(port, done);
  });

  elbow.run(it, `http://localhost:${port}/api`, path.join(__dirname, "setup"), {
    before,
    beforeBaseUrl: `http://localhost:${port}`,
  });
});
