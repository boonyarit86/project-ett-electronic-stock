const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require("../utils/multer");
const { createBoard, getAllBoards } = require('../controllers/boards-controllers');

const router = express.Router();

// router.post('/history', toolsController.getAllHistoryTools);
router.get('/', getAllBoards);
// router.get('/history', authMiddleware, getAllHistoryTools);
// router.get('/:tid', authMiddleware, getTool);

router.post("/create", authMiddleware, fileUpload.single("avartar"), createBoard)
// router.post('/actions/:tid', authMiddleware, actionTool);
// router.put('/history/restore', authMiddleware, restoreTool);
// router.put('/edit/:tid', authMiddleware, fileUpload.array('allImages', 10) , editTool);
// // router.post('/edithistory/:tid', toolsController.editHistoryTool);
// router.delete('/delete/:tid', authMiddleware, deleteTool);



module.exports = router;