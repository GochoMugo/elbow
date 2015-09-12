/*
 * Tests against The Elbow
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */


// built-in modules
import path from "path";


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
  elbow.run(it, `http://localhost:${port}`, path.join(__dirname, "schema"), {
    timeout: 5000,
  });
});


describe("sequence", function() {
  const port = 9097;
  testSequence.listen(port);
  elbow.run(it, `http://localhost:${port}`, path.join(__dirname, "sequence"));
});
