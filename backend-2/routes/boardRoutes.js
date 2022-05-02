const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/authMiddleware");
const restrictTo = require("../middlewares/restriction");
const boardController = require("../controllers/boardController");
const imageUpload = require("../middlewares/imageUpload");

// Check if user logged in
router.use(checkAuth);

// For members can access all of those routes
router.use(restrictTo("user", "admin", "staff"));
router.route("/").get(boardController.getAllBoards);
router.route("/history").get(boardController.getAllBoardHistory);
router.route("/:bid").get(boardController.getBoard);
router.route("/action/:bid").patch(boardController.boardAction);

router.use(restrictTo("admin", "staff"));
router.route("/check/:bid").get(boardController.checkAllToolOfBoard);
router.route("/").post(imageUpload.single("avatar"), boardController.createBoard);
router.route("/:bid").patch(
    imageUpload.fields([
      { name: "newAvatar", maxCount: 1 },
      { name: "newImages", maxCount: 3 },
    ]),
  boardController.editBoard
);
router.route("/restore/:bhid").patch(
boardController.restoreBoard
);
router.route("/request/:bid").patch(
  boardController.requestBoard
  );

router.use(restrictTo("admin"));
router.route("/:bid").delete(boardController.deleteBoard);

module.exports = router;
