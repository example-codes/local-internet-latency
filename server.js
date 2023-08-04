const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const path = require("node:path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "images"))); multiple static middlewares are possible
// all static middlewares stop when file is found

app.set("easy-app-root-path", __dirname);

app.use(cors()); // ignore

const getData = require("./app");

app.get("/data", async (req, res) => {
  const data = await getData();
  res.json(data);
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.listen(3000, () => console.log(`Server running on port 3000`));
