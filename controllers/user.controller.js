const user = require("../models/user.model");
const customError = require("../utils/customError");
const bigPromise = require("./../middleware/bigPromise");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;

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
