require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const cors = require("cors");
const models = require("./models/index");
const router = require("./routes/index");

const PORT = process.env.PORT || 2000;
const app = express();

app.use(cors())
app.use(express.json());
app.use("/api", router);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log("Server started at port:", PORT);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
