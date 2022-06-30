const orderModel = require("../models/order.model");
const bigPromise = require("./../middleware/bigPromise");
const Product = require("../models/product.model");
const customError = require("../utils/customError");

exports.createOrder = bigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await orderModel.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = bigPromise(async (req, res, next) => {
  const order = await orderModel
    .findById(req.params.id)
    .populate("user", "name email");

  if (!order) {
    return next(new CustomError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInOrders = bigPromise(async (req, res, next) => {
  const order = await orderModel.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminGetAllOrders = bigPromise(async (req, res, next) => {
  const orders = await orderModel.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = bigPromise(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(new customError("Order is already marked for delivered", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeleteOrder = bigPromise(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

async function updateProductStock(productId, quantity) {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}
