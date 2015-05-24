/*
* Tests against The Elbow
*
* The MIT License (MIT)
* Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
*/


// npm-installed modules
var should = require("should");


// own modules
var elbow = require("../.");
var testApp = require("./schema/app");


describe("module", function() {
  it("exports .run function", function() {
    should(elbow.run).be.a.Function;
  });

  it("exports .schemas function", function() {
    should(elbow.schemas).be.a.Function;
  });
});


describe("actual use case", function() {
  var port = 9095;
  testApp.listen(port);
  elbow.run(it, "http://localhost:" + port, __dirname + "/schema");
});
