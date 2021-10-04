const Notification = require("../models/notification");

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
    }

    let newNotification = new Notification({
      post: post,
    });

    console.log(newNotification)

    await newNotification.save();
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createNotificationTool,
};
