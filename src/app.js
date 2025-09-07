const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");

const app = express();
 
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
 

app.use("/api/users", userRoutes);



app.get("/", (req, res) => {
  res.send("Welcome to Betopia Project 1");
});

module.exports = app;
