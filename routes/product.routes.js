const express = require("express");
const {
  addProduct,
  getAllProduct,
  adminGetAllProduct,
  adminGetOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  getOneProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controllers/product.controller");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middleware/user");

// Admin Routes
router
  .route("/admin/addProduct")
  .post(isLoggedIn, customRole("admin"), addProduct);
router
  .route("/admin/getProducts")
  .get(isLoggedIn, customRole("admin"), adminGetAllProduct);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneProduct);
router
  .route("/admin/product/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneProduct);

// User Routes
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(isLoggedIn, getOneProduct);
router
  .route("/review")
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReview)
  .get(isLoggedIn, getOnlyReviewsForOneProduct);

module.exports = router;
