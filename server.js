const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  dbName: "StarkMetaAI",
});
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

const app = express();
// app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested With, Content-Type, Accept');
  next();
});
// app.use(bodyParser.json({ limit: "500mb" }));
// app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to stark-api application." });
});

const routes = require("./routes");
app.use("/api", routes);

const marketPlaceRoutes = require("./marketRoutes");
app.use("/marketplace-api", marketPlaceRoutes);

app.listen(5000, () => {
  console.log("Server Started at port 5000");
});
