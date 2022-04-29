const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/authMiddleware");
const removeInvalidInput = require("../middlewares/removeInvalidInput");
const restrictTo = require("../middlewares/restriction");
const userController = require("../controllers/userController");
const imageUpload = require("../middlewares/imageUpload");

router.route("/register").post(removeInvalidInput, userController.register);
router.route("/login").post(userController.login);

// Check if user logged in
router.use(checkAuth);

// For members can access all of those routes
router.use(restrictTo("user", "admin", "staff"));
router
  .route("/:userId")
  .get(userController.getUser)
  .patch(
    imageUpload.single("image"),
    removeInvalidInput,
    userController.editProfile
  );

// Check if this user is Admin
router.use(restrictTo("admin"));
router.route("/").get(userController.getAllusers);
router.route("/setRole/:userId").patch(userController.setUserRole);
router.route("/:userId").delete(userController.deleteUser);
module.exports = router;
