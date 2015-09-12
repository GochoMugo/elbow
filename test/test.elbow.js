/*
 * Tests against The Elbow
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 GochoMugo <mugo@forfuture.co.ke>
 */

// npm-installed modules
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _should = require("should");

// own modules

var _should2 = _interopRequireDefault(_should);

var _ = require("../.");

var _2 = _interopRequireDefault(_);

var _schemaApp = require("./schema/app");

var _schemaApp2 = _interopRequireDefault(_schemaApp);

describe("module", function () {
  it("exports .run function", function () {
    (0, _should2["default"])(_2["default"].run).be.a.Function();
  });

  it("exports .schemas function", function () {
    (0, _should2["default"])(_2["default"].schemas).be.a.Function();
  });
});

describe("actual use case", function () {
  var port = 9095;
  _schemaApp2["default"].listen(port);
  _2["default"].run(it, "http://localhost:" + port, __dirname + "/schema");
});