const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require("../utils/multer");
const { createTool, getAllTools } = require('../controllers/tools-controllers');

const router = express.Router();

// router.post('/history', toolsController.getAllHistoryTools);
// router.get('/:tid', toolsController.getTool);
router.get('/', authMiddleware, getAllTools);

// path ด้านล่างจะใช้ได้ต่อเมื่อ ต้องล็อคอินก่อน เพื่อสร้าง Token JWT ยืนยันตัวตน
// router.use(checkAuth);

router.post("/create", authMiddleware, fileUpload.single("avartar"), createTool)
// router.post('/actions/:tid', toolsController.actionTool);
// router.post('/edit/:tid', fileUpload.array('allImages', 10) ,toolsController.editTool);
// router.post('/edithistory/:tid', toolsController.editHistoryTool);
// router.delete('/delete/:tid', toolsController.deleteTool);



module.exports = router;