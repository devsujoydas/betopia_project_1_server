require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./src/config/db");
const appRoutes = require("./src/app");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://guiheandco.vercel.app",
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to Betopia Project 1 v1");
});

app.use("/", appRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
