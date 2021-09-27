const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const fileUpload = require("../utils/multer");
const {
  createBoard,
  getAllBoards,
  getBoard,
  editBoard,
  deleteBoard,
  actionBoard,
  restoreBoard,
  getAllHistoryBoards,
  checkBoardEquipment,
  requestBoard,
  restoreBoardandTools,
} = require("../controllers/boards-controllers");

const router = express.Router();

// router.post('/history', toolsController.getAllHistoryTools);
router.get("/", authMiddleware, getAllBoards);
router.get("/history", authMiddleware, getAllHistoryBoards);
router.get("/:bid", authMiddleware, getBoard);

router.post(
  "/create",
  authMiddleware,
  fileUpload.single("avartar"),
  createBoard
);
router.post("/request", authMiddleware, requestBoard);
router.post("/check/:bid", authMiddleware, checkBoardEquipment);
router.post("/actions/:bid", authMiddleware, actionBoard);
router.put("/history/restore", authMiddleware, restoreBoard);
router.put("/history/restore/boardandtools", authMiddleware, restoreBoardandTools);
router.put(
  "/edit/:bid",
  authMiddleware,
  fileUpload.array("allImages", 10),
  editBoard
);
// // router.post('/edithistory/:tid', toolsController.editHistoryTool);
router.delete("/delete/:bid", authMiddleware, deleteBoard);

module.exports = router;
