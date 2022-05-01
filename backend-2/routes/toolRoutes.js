const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/authMiddleware");
const restrictTo = require("../middlewares/restriction");
const toolController = require("../controllers/toolController");
const imageUpload = require("../middlewares/imageUpload");

// Check if user logged in
router.use(checkAuth);

// For members can access all of those routes
router.use(restrictTo("user", "admin", "staff"));
router.route("/").get(toolController.getAllTools);
router.route("/:tid").get(toolController.getTool);
router.route("/action/:tid").patch(toolController.toolAction);

router.use(restrictTo("admin", "staff"));
router.route("/").post(toolController.createTool);
router.route("/:tid").patch(
    imageUpload.fields([
      { name: "newAvatar", maxCount: 1 },
      { name: "newImages", maxCount: 3 },
    ]),
  toolController.editTool
);
router.route("/restore/:thid").patch(
toolController.restoreTool
);

router.use(restrictTo("admin"));
router.route("/:tid").delete(toolController.deleteTool);

module.exports = router;
