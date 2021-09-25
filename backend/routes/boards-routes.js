const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require("../utils/multer");
const { createBoard, getAllBoards, getBoard, editBoard, deleteBoard } = require('../controllers/boards-controllers');

const router = express.Router();

// router.post('/history', toolsController.getAllHistoryTools);
router.get('/', authMiddleware, getAllBoards);
// router.get('/history', authMiddleware, getAllHistoryTools);
router.get('/:bid', authMiddleware, getBoard);

router.post("/create", authMiddleware, fileUpload.single("avartar"), createBoard)
// router.post('/actions/:tid', authMiddleware, actionTool);
// router.put('/history/restore', authMiddleware, restoreTool);
router.put('/edit/:bid', authMiddleware, fileUpload.array('allImages', 10) , editBoard);
// // router.post('/edithistory/:tid', toolsController.editHistoryTool);
router.delete('/delete/:bid', authMiddleware, deleteBoard);



module.exports = router;