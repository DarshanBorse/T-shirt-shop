const user = require("../models/user.model");
const customError = require("../utils/customError");
const bigPromise = require("./../middleware/bigPromise");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/mailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

exports.signup = bigPromise(async (req, res, next) => {
  if (!req.files) {
    return next(new customError(`photo is required for signup`, 400));
  }

  const { name, email, password } = req.body;

  if (!(name || email || password)) {
    return next(new customError("Name, Email and Password are required.", 400));
  }

  const file = req.files.photo;

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "user",
    width: 150,
    crop: "scale",
  });

  const saveUser = await user.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(saveUser, res);
});

exports.login = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for presence of email and password
  if (!(email && password)) {
    return next(new customError(`Please provide email and password`, 400));
  }

  // Get user from DB
  const userExist = await user.findOne({ email }).select("+password");

  // User not found in DB
  if (!userExist) {
    return next(
      new customError(`Email or password does not match or exist`, 400)
    );
  }

  // Match the password
  const passwordValidation = await userExist.isValidatedPassword(password);

  // if password do not match
  if (!passwordValidation) {
    return next(
      new customError(`Email or password does not match or exist`, 400)
    );
  }

  // if goes all good and we send the token
  cookieToken(userExist, res);
});

exports.logout = bigPromise(async (req, res, next) => {
  // Clear the cookie
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  //send JSON response for success
  res.status(200).json({
    success: true,
    message: "Logout Success",
  });
});

exports.forgotPassword = bigPromise(async (req, res, next) => {
  // collect email
  const { email } = req.body;

  // find user in database
  const userExist = await user.findOne({ email });

  // if user not found in database
  if (!userExist) {
    return next(new customError("Email not found as registered", 400));
  }

  //get token from user model methods
  const forgotToken = userExist.getForgotPasswordToken();

  // save user fields in DB
  await userExist.save({ validateBeforeSave: false });

  // create a URL
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  // craft a message
  const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

  // attempt to send email
  try {
    await mailHelper({
      email: userExist.email,
      subject: "LCO TStore - Password reset email",
      message,
    });

    // json response if email is success
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    // reset user fields if things goes wrong
    userExist.forgotPasswordToken = undefined;
    userExist.forgotPasswordExpiry = undefined;
    await userExist.save({ validateBeforeSave: false });

    // send error response
    return next(new customError(error.message, 500));
  }
});

exports.passwordReset = bigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const userExist = await user.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!userExist) {
    return next(new customError("Token is invalid or expired", 400));
  }

  if (!(req.body.password && req.body.confirmPassword)) {
    return next(
      new customError("Please Provide password and confirm password", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new customError("password and confirm password do not match", 400)
    );
  }

  // update password field in DB
  userExist.password = req.body.password;

  // reset token fields
  userExist.forgotPasswordToken = undefined;
  userExist.forgotPasswordExpiry = undefined;

  // save the user
  await userExist.save();

  // send a JSON response OR send token

  cookieToken(userExist, res);
});

exports.getLoggedInUserDetails = bigPromise(async (req, res, next) => {
  //req.user will be added by middleware
  // find user by id
  const userExist = await user.findById(req.user.id);

  //send response and user data
  return res.status(200).json({
    success: true,
    userExist,
  });
});

exports.changePassword = bigPromise(async (req, res, next) => {
  const { oldPassword, password } = req.body;

  if (!(oldPassword && password)) {
    return next(
      new customError("Please provide old password and new password", 401)
    );
  }

  const userId = req.user.id;

  const userExist = await user.findById(userId).select("+password");

  const isCorrectOldPassword = await userExist.isValidatedPassword(oldPassword);

  if (!isCorrectOldPassword) {
    return next(new customError("Old password is incorrect", 400));
  }

  userExist.password = password;

  await userExist.save();

  cookieToken(userExist, res);
});

exports.updateUserDetails = bigPromise(async (req, res, next) => {
  const { email, name } = req.body;

  if (!(email && name)) {
    return next(new customError("Please provide name and email"));
  }

  const newData = {
    email,
    name,
  };

  if (req.files) {
    const userExist = await user.findById(req.user.id);

    await cloudinary.uploader.destroy(userExist.photo.id);

    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "user",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  await user.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true });
});

exports.adminAllUsers = bigPromise(async (req, res, next) => {
  const users = await user.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = bigPromise(async (req, res, next) => {
  const users = await user.findById(req.params.id);

  if (!users) {
    return next(new customError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminUpdateOneUserDetails = bigPromise(async (req, res, next) => {
  const { email, name, role } = req.body;

  if (!(email && name && role)) {
    return next(new customError("Please provide name, role and email"));
  }

  const newData = {
    email,
    name,
    role,
  };

  const users = await user.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!users) {
    return next(new customError("No Such user found", 401));
  }

  res.status(200).json({ success: true });
});

exports.adminDeleteOneUserDetails = bigPromise(async (req, res, next) => {
  const users = await user.findById(req.params.id);

  if (!users) {
    return next(new customError("No Such user found", 401));
  }

  const imageId = users.photo.id;

  await cloudinary.uploader.destroy(imageId);

  await users.remove();

  res.status(200).json({
    success: true,
  });
});

exports.managerAllUser = bigPromise(async (req, res, next) => {
  const users = await user.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});
