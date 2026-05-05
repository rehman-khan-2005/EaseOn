process.env.NODE_ENV = "production";
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);
app.use("/api/circles", require("./routes/circleMessages"));

app.get("/", (req, res) => {
  res.json({ name: "Ease-On API", version: "1.0.0", status: "running" });
});

app.use(errorHandler);

exports.api = functions.https.onRequest(app);
// Mon Apr 27 15:21:33 EDT 2026
