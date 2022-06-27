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
app.use(fileUpload());

// Regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// morgan middleware
app.use(morgan("tiny"));

// import all routes here
const home = require("./routes/home.routes");

// routes middleware
app.use("/api/v1", home);

// export app js
module.exports = app;
