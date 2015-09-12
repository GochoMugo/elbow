// npm-installed modules
import _ from "lodash";
import bodyParser from "body-parser";
import express from "express";


// module variables
const app = express();
let cache = { };


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// endpoints
app.use("/sequence", function(req, res) {
  // use query if available
  if (!_.isEmpty(req.query)) {
    cache = req.query;
  }

  // use body if available
  if (!_.isEmpty(req.body)) {
    cache = req.body;
  }

  // return cache
  return res.json(cache);
});


export default app;
