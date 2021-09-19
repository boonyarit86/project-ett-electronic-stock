const express = require("express");
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require("../utils/multer");
const usersController = require("../controllers/users-controllers");
// const io = require("../index");

const router = express.Router();
router.get("/", authMiddleware, usersController.getUsers);
router.get("/profile", authMiddleware, usersController.getUser);
router.post("/signup", usersController.signup);
router.post("/login", usersController.login);

// path ด้านล่างจะใช้ได้ต่อเมื่อ ต้องล็อคอินก่อน เพื่อสร้าง Token JWT ยืนยันตัวตน
// router.use(checkAuth);

router.put("/edit/:uid", authMiddleware, fileUpload.single("avartar"), usersController.editProfile)
router.put('/approve/:uid', authMiddleware, usersController.approveUser);
router.put('/edit/status/:uid', authMiddleware, usersController.editStatusUser);
router.delete("/:uid", authMiddleware, usersController.deleteUser)

module.exports = router;
