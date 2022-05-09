const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/authMiddleware");
const restrictTo = require("../middlewares/restriction");
const tcsController = require("../controllers/tcsController");

// Check if user logged in
router.use(checkAuth);
// Check if this user is Admin
router.use(restrictTo("user", "admin", "staff"));
router.route("/").get(tcsController.getAll).post(tcsController.createOne);
router
  .route("/:tcsId")
  .patch(tcsController.editOne)
  .delete(tcsController.deleteOne);

module.exports = router;
