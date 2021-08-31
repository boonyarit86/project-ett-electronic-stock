const express = require('express');
// const checkAuth = require('../middleware/check-auth');

const toolsController = require('../controllers/tools-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.post('/history', toolsController.getAllHistoryTools);
router.get('/:tid', toolsController.getTool);
router.get('/', toolsController.getAllTools);

// path ด้านล่างจะใช้ได้ต่อเมื่อ ต้องล็อคอินก่อน เพื่อสร้าง Token JWT ยืนยันตัวตน
// router.use(checkAuth);

router.post("/newtool", fileUpload.single("imageProfile"), toolsController.createTool)
router.post('/actions/:tid', toolsController.actionTool);
router.post('/edit/:tid', fileUpload.array('allImages', 10) ,toolsController.editTool);
router.post('/edithistory/:tid', toolsController.editHistoryTool);
router.delete('/delete/:tid', toolsController.deleteTool);



module.exports = router;