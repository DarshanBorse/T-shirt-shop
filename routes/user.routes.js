const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
  adminAllUsers,
  managerAllUser,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUserDetails,
} = require("../controllers/user.controller");
const { isLoggedIn, customRole } = require("../middleware/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userDashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userDashboard/update").post(isLoggedIn, updateUserDetails);

// Admin Routes
router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminAllUsers);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole("admin"), adminGetOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUserDetails);

// Manager Routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUser);

module.exports = router;
