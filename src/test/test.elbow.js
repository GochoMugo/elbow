/*
 * Tests against The Elbow
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


// npm-installed modules
import should from "should";


// own modules
import elbow from "../.";
import testApp from "./schema/app";
import testSequence from "./sequence/app";


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
  testApp.listen(port);
  elbow.run(it, `http://localhost:${port}`, `${__dirname}/schema`);
});


describe.skip("sequence", function() {
  const port = 9097;
  testSequence.listen(port);
  elbow.run(it, `http://localhost:${port}`, `${__dirname}/sequence`);
});