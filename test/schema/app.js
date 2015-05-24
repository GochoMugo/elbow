// npm-installed modules
var _ = require("lodash");
var bodyParser = require('body-parser');
var express = require("express");


// module variables
var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// endpoints
app.use("/simple", function(req, res) {
  return res.json({
    username: "mugo",
    email: "mugo@forfuture.co.ke"
  });
});


app.use("/params", function(req, res) {
  var resObj = _.keys(req.query).length === 0 ? req.body : req.query;
  return res.json(resObj);
});


exports = module.exports = app;

