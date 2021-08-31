const express = require('express');
// const checkAuth = require('../middleware/check-auth');

const boardsController = require('../controllers/boards-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/incomplete', boardsController.getIncompleteBoard);
router.get('/history', boardsController.getAllHistoryBoards);
router.get('/:bid', boardsController.getBoard);
router.get('/', boardsController.getAllBoards);
// router.get('/:uid', usersController.getUser);


// path ด้านล่างจะใช้ได้ต่อเมื่อ ต้องล็อคอินก่อน เพื่อสร้าง Token JWT ยืนยันตัวตน
// router.use(checkAuth);

router.post('/actions/:bid', boardsController.actionBoard);
router.post('/edit/:bid', fileUpload.array('allImages', 10) ,boardsController.editBoard);
router.post("/newboard", fileUpload.single("imageProfile"), boardsController.createBoard)
router.post('/request/:bid', boardsController.requestBoard);
router.post('/request/incomplete/:bid', boardsController.requestBoardandIncompleteTool);
router.post('/restore/:htbid', boardsController.cancelRequestBoard);
router.post('/restore/incomplete/:htbid', boardsController.cancelRequestBoardandIncomplete);
router.post('/update/incomplete/:incompleteId', boardsController.updateIncompleteBoard);
// router.post('/edit/:tid', fileUpload.array('allImages', 10) ,toolsController.editTool);
router.delete('/delete/:bid', boardsController.deleteBoard);



module.exports = router;