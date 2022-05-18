const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/authMiddleware");
const restrictTo = require("../middlewares/restriction");
const numHistoryController = require("../controllers/numHistoryController");

// Check if user logged in
router.use(checkAuth);
// Check if this user is Admin
router.use(restrictTo("admin"));
router.route("/").post(numHistoryController.createOne);

module.exports = router;
