// npm-installed modules
import express from "express";


// module variables
const app = express();


// endpoints
app.use("/api/test", function(req, res) {
  return res.json({ received: true });
});


export default app;
