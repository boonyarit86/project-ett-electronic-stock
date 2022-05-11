const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { io } = require("../app");

const deleteExpireditem = async (data) => {
  let docs = [];
  if (data.length > 0) {
    data.forEach(async (item) => {
      // Uncomment when finishing this project
      // let expHistory = new Date(item.exp).getTime();
      // let currentDate = new Date().getTime();
      // if (expHistory < currentDate) {
      //   await BoardHistory.findByIdAndDelete(item.id);
      //   return;
      // }
      docs.push(item);
    });
  }
  return docs;
};

exports.getAllnotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find();
  const docs = await deleteExpireditem(notifications);
  const user = await User.findById(req.user.id);

  let data = {
    notifications: docs,
    unreadNotifications: user.unreadNotification,
  };

  io.emit("Allnotification-action", data);

  res.status(200).json({
    status: "success",
    results: docs.length,
    data,
  });
});

exports.readNotifications = catchAsync(async (req, res, next) => {
  console.log("Reset notification")
  const user = await User.findById(req.user.id);
//   user.unreadNotification = 0;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
