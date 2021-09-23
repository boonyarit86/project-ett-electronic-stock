const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require("../utils/multer");
const { createTool, getAllTools, actionTool, getTool, editTool, deleteTool, getAllHistoryTools, restoreTool } = require('../controllers/tools-controllers');

const router = express.Router();

// router.post('/history', toolsController.getAllHistoryTools);
router.get('/', getAllTools);
router.get('/history', authMiddleware, getAllHistoryTools);
router.get('/:tid', authMiddleware, getTool);

router.post("/create", authMiddleware, fileUpload.single("avartar"), createTool)
router.post('/actions/:tid', authMiddleware, actionTool);
router.put('/history/restore', authMiddleware, restoreTool);
router.put('/edit/:tid', authMiddleware, fileUpload.array('allImages', 10) , editTool);
// router.post('/edithistory/:tid', toolsController.editHistoryTool);
router.delete('/delete/:tid', authMiddleware, deleteTool);



module.exports = router;