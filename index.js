require("dotenv").config();
const connectDB = require("./src/config/db");

const app = require("./src/app");
const port = process.env.PORT || 3000;
connectDB();


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
