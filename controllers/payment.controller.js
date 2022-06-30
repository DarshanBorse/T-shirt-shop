const bigPromise = require("./../middleware/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Razorpay = require("razorpay");

// Stripe
exports.sendStripeKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = bigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    automatic_payment_methods: { enabled: true },
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    client_secret: paymentIntent.client_secret,
  });
});

// Razorpay
exports.sendRazorpayKey = bigPromise(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = bigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  const order = await instance.orders.create({
    amount: 50000,
    currency: "INR",
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: order,
  });
});
