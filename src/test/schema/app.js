/*
 * The MIT License (MIT)
 * Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
 *
 * A server that inspects the requests made by the elbow utility,
 * while exposing simple schemas for other users.
 */


// installed modules
import _ from "lodash";
import bodyParser from "body-parser";
import express from "express";


// module variables
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// endpoints
app.use("/simple", function(req, res) {
  return res.json({
    username: "mugo",
    email: "mugo@forfuture.co.ke",
  });
});


app.use("/params", function(req, res) {
  const resObj = _.keys(req.query).length === 0 ? req.body : req.query;
  return res.json(resObj);
});


app.use("/headers", function(req, res) {
  return res.json(req.headers);
});


app.use("/query", function(req, res) {
  return res.json(req.query);
});


app.use("/body", function(req, res) {
  return res.json(req.body);
});


app.use("/ref", function(req, res) {
  return res.json({
    type: "string",
    enum: ["value"],
  });
});


app.use("/timeout", function(req, res) {
  const timeout = 4000;
  setTimeout(function() {
    res.json({
      timeout,
    });
  }, timeout);
});


app.use("/status", function(req, res) {
  const status = Number(req.query.status) || req.body.status || 200;
  return res.status(status).json({ status });
});


export default app;
