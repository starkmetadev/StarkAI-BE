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
app.use(express.json());
app.use(cors());

const routes = require("./routes");
app.use("/api", routes);

app.listen(5000, () => {
  console.log("Server Started at 5000");
});
