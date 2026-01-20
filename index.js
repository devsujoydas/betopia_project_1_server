const connectDB = require("./src/config/db");
require("dotenv").config({ quiet: true });
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express()
const appRoutes = require("./src/app");
const port = process.env.PORT || 3000;

connectDB();



app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://guiheandco.netlify.app",
    "https://guiheandco.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/", appRoutes)

app.get("/", (req, res) => {
  res.send("Welcome to Betopia Project 1 v1");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
