const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { JWT_SECRET, JWT_EXPIRY } = process.env;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Name should be under 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    validate: [validator.isEmail, "Please enter email in correct formate."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password should be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypt password before save - HOOKS
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcryptjs.hash(this.password, 10);
});

// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (userSendPassword) {
  return await bcryptjs.compare(userSendPassword, this.password);
};

// validate the password with passed on user password
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
};

//generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = () => {
  // generate a long and randomg string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // getting a hash - make sure to get a hash on backend
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  //time of token and time is 20 minute
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
