/*
 * The MIT License (MIT)
 * Copyright (c) 2015-2017 GochoMugo <mugo@forfuture.co.ke>
 *
 * A simple server that tracks setup state.
 */


// installed modules
import express from "express";


// module variables
const app = express();
let setup1 = false;
let setup2 = false;


app.use("/setup/1", function(req, res) {
  setup1 = true;
  return res.json({ setup: { token: "setup1" } });
});


app.use("/setup/2", function(req, res) {
  if (!setup1) return res.status(406).json({ ok: false });
  setup2 = true;
  return res.json({ setup: { token: "setup2" } });
});


app.use("/api/confirm", function(req, res) {
  if (!setup1 || !setup2) return res.status(406).json({ ok: false });
  return res.json(req.query);
});


export default app;
