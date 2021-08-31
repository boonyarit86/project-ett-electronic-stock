const express = require("express");
const authMiddleware = require('../middleware/authMiddleware');

const usersController = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersController.getUsers);
router.get("/profile", authMiddleware, usersController.getUser);

router.post("/signup", usersController.signup);
router.post("/login", usersController.login);

// path ด้านล่างจะใช้ได้ต่อเมื่อ ต้องล็อคอินก่อน เพื่อสร้าง Token JWT ยืนยันตัวตน
// router.use(checkAuth);

// router.patch("/edit/:uid", fileUpload.single("image"), usersController.editProfile)
// router.patch('/approve/:uid', usersController.approveUser);

// router.delete("/approve/:uid", usersController.deleteUser)

module.exports = router;
