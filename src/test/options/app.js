/*
 * The MIT License (MIT)
 * Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
 *
 * A simple server that responds with an object containing the
 * headers, query(string) and body.
 */


// installed modules
import express from "express";
import bodyParser from "body-parser";


// module variables
const app = express();


app.use(bodyParser.json());


app.use(function(req, res) {
  return res.json({
    headers: req.headers,
    query: req.query,
    body: req.body,
  });
});


export default app;
