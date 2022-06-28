require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

// Const app initialize
const app = express();

// for swagger documentation middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// cookieParser and fileUpload middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// EJS middleware
app.set("view engine", "ejs");

// Regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// morgan middleware
app.use(morgan("tiny"));

// import all routes here
const home = require("./routes/home.routes");
const user = require("./routes/user.routes");
const product = require("./routes/product.routes");

// routes middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);

// frontend testing route
app.get("/postform", (req, res) => {
  return res.render("postForm");
});

app.get("/", (req, res) => {
  return res.send(`Hello from t-shirt`);
});

// export app js
module.exports = app;
