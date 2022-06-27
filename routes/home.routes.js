const express = require("express");
const router = express.Router();
const { home } = require("../controllers/home.controller");
const { homeDummy } = require("../controllers/home.controller");

router.route("/").get(home);
router.route("/dummy").get(homeDummy);

module.exports = router;
