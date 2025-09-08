const connectDB = require("./src/config/db");
require("dotenv").config({ quiet: true });

const app = require("./src/app");
const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
