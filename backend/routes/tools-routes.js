const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require("../utils/multer");
const { createTool, getAllTools, actionTool, getTool, editTool } = require('../controllers/tools-controllers');

const router = express.Router();

// router.post('/history', toolsController.getAllHistoryTools);
router.get('/', getAllTools);
router.get('/:tid', authMiddleware, getTool);

// path ด้านล่างจะใช้ได้ต่อเมื่อ ต้องล็อคอินก่อน เพื่อสร้าง Token JWT ยืนยันตัวตน
// router.use(checkAuth);

router.post("/create", authMiddleware, fileUpload.single("avartar"), createTool)
router.post('/actions/:tid', authMiddleware, actionTool);
router.put('/edit/:tid', authMiddleware, fileUpload.array('allImages', 10) , editTool);
// router.post('/edithistory/:tid', toolsController.editHistoryTool);
// router.delete('/delete/:tid', toolsController.deleteTool);



module.exports = router;