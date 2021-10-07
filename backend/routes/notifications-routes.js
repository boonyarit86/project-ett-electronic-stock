const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/notification");
const User = require("../models/user");
const { orderData } = require("../utils/covertData");

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    let notifications = await Notification.find().populate("user");
    let newArr = await orderData(notifications)
    res.status(200).json(newArr);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถดึงข้อมูลการแจ้งเตือนได้");
  }
});


router.post("/", authMiddleware, async (req, res) => {
    try {
        let user = await User.findById(req.userId);
        user.unreadNotification = 0;
        await user.save();
        res.status(200).send("clear notification")
      } catch (error) {
        console.log(error)
        res.status(500).send("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถดึงข้อมูลการแจ้งเตือนได้")
      }
});


module.exports = router;
