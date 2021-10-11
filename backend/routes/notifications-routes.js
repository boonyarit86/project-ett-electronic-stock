const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/notification");
const User = require("../models/user");

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    let notifications = await Notification.find().populate("user");

    let responseData = [];
    for (var round = 0; round < notifications.length; round++) {
        let expHistory = new Date(notifications[round].date).getTime() + 1000 * 60 * (1440 * 7);
        let currentDate = new Date().getTime();
        if (expHistory < currentDate) {
          await notifications[round].remove();
        } else {
          responseData.unshift(notifications[round]);
        }
    }
    
    res.status(200).json(responseData);
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
