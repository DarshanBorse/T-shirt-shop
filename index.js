const app = require("./app");
const connectedWithCloudinary = require("./config/cloudinary.config");
const connectedWithDb = require("./config/db.config");
require("dotenv").config();

// Database Connection
connectedWithDb();

// Cloudinary connection
connectedWithCloudinary();

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port : ${process.env.PORT}`);
});
