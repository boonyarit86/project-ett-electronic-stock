const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/authMiddleware");
const restrictTo = require("../middlewares/restriction");
const ttsController = require("../controllers/ttsController");

// Check if user logged in
router.use(checkAuth);
// Check if this user is Admin
router.use(restrictTo("admin"));
router.route("/").get(ttsController.getAll).post(ttsController.createOne);
router
  .route("/:ttsId")
  .patch(ttsController.editOne)
  .delete(ttsController.deleteOne);

module.exports = router;
