const Notification = require("../models/notification");
const User = require("../models/user");
const io = require("../index");
const { orderData } = require("../utils/covertData");

const countNotificationOfUser = async () => {
  let users = await User.find();
  let response = [];
  for (let round = 0; round < users.length; round++) {
    let user = await User.findById(users[round]._id);
    if (user) {
      user.unreadNotification = user.unreadNotification + 1;
      response.push({
        _id: user._id,
        unreadNotification: user.unreadNotification,
      });
    }
    await user.save();
  }
  io.emit("unreadNotification-actions", response);
};

const createNotificationTool = async (tool) => {
  try {
    let post = "";
    if (tool.total <= tool.limit && tool.limit !== 0) {
      if (!tool.isAlert && tool.total !== 0) {
        // console.log("Getting out of")
        post = `อุปกรณ์ ${tool.toolName} กำลังจะหมด`;
      }
      if (tool.total === 0) {
        // console.log("tool's out of stock")
        post = `อุปกรณ์ ${tool.toolName} หมด`;
      }

      if (post !== "") {
        tool.isAlert = true;
        let newNotification = new Notification({
          post: post,
        });

        // console.log(newNotification)

        await newNotification.save();
        await countNotificationOfUser();
        let notifications = await Notification.find().populate("user");
        let newData = await orderData(notifications);
        io.emit("notification-actions", newData);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const createNotificationBoard = async (board) => {
  try {
    let post = "";
    if (board.total <= board.limit && board.limit !== 0) {
      if (!board.isAlert && board.total !== 0) {
        // console.log("Getting out of")
        post = `บอร์ด ${board.boardName} กำลังจะหมด`;
      }
      if (board.total === 0) {
        // console.log("board's out of stock")
        post = `บอร์ด ${board.boardName} หมด`;
      }
      if (post !== "") {
        board.isAlert = true;

        let newNotification = new Notification({
          post: post,
        });

        // console.log(newNotification)

        await newNotification.save();
        await countNotificationOfUser();
        let notifications = await Notification.find().populate("user");
        let newData = await orderData(notifications);
        io.emit("notification-actions", newData);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createNotificationBoard,
  createNotificationTool,
};
