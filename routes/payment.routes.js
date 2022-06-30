const express = require("express");
const {
  sendStripeKey,
  captureStripePayment,
  sendRazorpayKey,
  captureRazorpayPayment,
} = require("../controllers/payment.controller");
const router = express.Router();
const { isLoggedIn } = require("../middleware/user");

//Stripe Key and Razorpay key Routes
router.route("/sendStripeKey").get(isLoggedIn, sendStripeKey);
router.route("/sendRazorpayKey").get(isLoggedIn, sendRazorpayKey);

//Stripe Key and Razorpay key Routes
router.route("/captureStripe").get(isLoggedIn, captureStripePayment);
router.route("/captureRazorpay").get(isLoggedIn, captureRazorpayPayment);

module.exports = router;
