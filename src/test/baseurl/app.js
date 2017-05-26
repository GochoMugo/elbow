/*
 * The MIT License (MIT)
 * Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
 *
 * A simple server that responds with a simple object.
 */


// installed modules
import express from "express";


// module variables
const app = express();


// endpoints
app.use("/api/test", function(req, res) {
  return res.json({ received: true });
});


export default app;
