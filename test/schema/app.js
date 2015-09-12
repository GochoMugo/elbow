// npm-installed modules
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _express = require("express");

// module variables

var _express2 = _interopRequireDefault(_express);

var app = (0, _express2["default"])();

app.use(_bodyParser2["default"].json());
app.use(_bodyParser2["default"].urlencoded({ extended: true }));

// endpoints
app.use("/simple", function (req, res) {
  return res.json({
    username: "mugo",
    email: "mugo@forfuture.co.ke"
  });
});

app.use("/params", function (req, res) {
  var resObj = _lodash2["default"].keys(req.query).length === 0 ? req.body : req.query;
  return res.json(resObj);
});

exports["default"] = app;
module.exports = exports["default"];