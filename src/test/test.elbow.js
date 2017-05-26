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


describe("module", function() {
  it("exports .run function", function() {
    should(elbow.run).be.a.Function();
  });

  it("exports .schemas function", function() {
    should(elbow.schemas).be.a.Function();
  });
});


describe("actual use case", function() {
  const port = 9095;

  before(function(done) {
    testApp.listen(port, done);
  });

  elbow.run(it, `http://localhost:${port}`, path.join(__dirname, "schema"), {
    timeout: 5000,
  });
});


describe("sequence", function() {
  const port = 9097;

  before(function(done) {
    testSequence.listen(port, done);
  });

  elbow.run(it, `http://localhost:${port}`, path.join(__dirname, "sequence"));
});


describe("api baseurl", function() {
  const port = 9923;

  before(function(done) {
    testBaseurl.listen(port, done);
  });

  elbow.run(it, `http://localhost:${port}/api`, path.join(__dirname, "baseurl"));
});
