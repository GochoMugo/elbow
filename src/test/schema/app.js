// npm-installed modules
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


export default app;
