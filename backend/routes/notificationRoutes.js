const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/authMiddleware");
const restrictTo = require("../middlewares/restriction");
const notificationController = require("../controllers/notificationController");

// Check if user logged in
router.use(checkAuth);

// For members can access all of those routes
router.use(restrictTo("user", "admin", "staff"));
router
  .route("/")
  .get(notificationController.getAllnotifications)
  .post(notificationController.readNotifications);
module.exports = router;
