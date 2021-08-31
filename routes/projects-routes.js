const express = require('express');
// const checkAuth = require('../middleware/check-auth');

const projectsController = require('../controllers/projects-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/history', projectsController.getAllHistoryProjects);
router.get('/:pid', projectsController.getProject);

// path ด้านล่างจะใช้ได้ต่อเมื่อ ต้องล็อคอินก่อน เพื่อสร้าง Token JWT ยืนยันตัวตน
// router.use(checkAuth);

router.post("/newproject", fileUpload.array('allImages', 10), projectsController.createProject)
router.post("/newproject/incomplete", fileUpload.array('allImages', 10), projectsController.createProjectandIncomplete)
router.post('/update/incomplete/:incompleteId', projectsController.updateIncompleteProject);
router.post('/restore/:pid', projectsController.cancelRequestProject);
router.post('/restore/incomplete/:pid', projectsController.cancelRequestProjectandIncomplete);

module.exports = router;