const express = require("express");
const {
  addProduct,
  getAllProduct,
} = require("../controllers/product.controller");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/addProduct").post(isLoggedIn, customRole("admin"), addProduct);
router.route("/products").get(isLoggedIn, customRole("user"), getAllProduct);

module.exports = router;
