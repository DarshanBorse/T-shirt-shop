const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const customError = require("../utils/customError");
const bigPromise = require("./bigPromise");

exports.isLoggedIn = bigPromise(async (req, res, next) => {
  // check token first in cookies
  let token = req.cookies.token;

  if (!token && req.header("Authorization")) {
    token = req.header("Authorization").replace("Bearer ", "");
  }

  if (!token) {
    return next(new customError("Login first to access this page", 401));
  }

  const decode = jwt.verify(token, process.env.JWT_SECRET);

  if (!decode) {
    return next(new customError("Token Expires", 401));
  }

  const user = await userModel.findById(decode.id);

  req.user = user;

  next();
});

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new customError("you are not allowed for this resource", 403)
      );
    }
    next();
  };
};
