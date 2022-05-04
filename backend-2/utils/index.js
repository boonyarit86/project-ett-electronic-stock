const Tool = require("../models/toolModel");

// Image
const hasImage = (img) =>
  Boolean(img?.public_id !== undefined && img?.url !== undefined);
const hasImageArray = (img) => Boolean(img?.length > 0);
const hasFile = (file) => file?.filename !== undefined;

// Item
const hasItem = (item) => item?.length > 0 && item !== null;
const isNotItemGoingOut = (item) => {
  return Boolean(item.total > item.limit && item.isAlert === true);
};
const isItemGoingOut = (item) => {
  return Boolean(item.total <= item.limit && item.isAlert === false);
};
const isItemOut = (item) => Boolean(item === 0);
const calculateLeftItem = (action, itemName, givenItem, data) => {
  let message;
  if (action === "add") {
    data.total += givenItem;
    message = `เพิ่ม${itemName}`;
  } else {
    data.total -= givenItem;
    message = `เบิก${itemName}`;
  }
  return message;
};

const definedAction = (data) => {
  let action = "request";
  if (data.startsWith("เพิ่ม")) action = "add";
  return action;
};

const calculateAndRestoreItem = (action, itemName, givenItem, data) => {
  let message;
  if (action === "add") {
    data.total -= givenItem;
    message = `ยกเลิกการเพิ่ม${itemName}`;
  } else {
    data.total += givenItem;
    message = `ยกเลิกการเบิก${itemName}`;
  }
  return message;
};

const handleSelectedItem = async (board, tools, err) => {
  let toolArr = [];
  if (hasItem(tools)) {
    for (let r = 0; r < tools.length; r++) {
      let tool = await Tool.findById(tools[r].tid);
      if (!tool) {
        err.message = `ไม่พบรายการอุปกรณ์ ${tools[r].toolName}`;
        err.status = 404;
        break;
      }

      let docs = tools.filter((x) => tools[r].tid === x.tid);
      if (docs.length > 1) {
        err.message = `อุปกรณ์ ${tools[r].toolName} มีมากกว่า 1 รายการ`;
        err.status = 400;
        break;
      }
      toolArr.push({
        total: tools[r].total,
        detail: tools[r].tid,
        type: tool.type,
        category: tool.category,
      });
    }
  }
  board.tools = toolArr;
};

exports.hasImage = hasImage;
exports.hasImageArray = hasImageArray;
exports.hasFile = hasFile;

exports.hasItem = hasItem;
exports.isNotItemGoingOut = isNotItemGoingOut;
exports.isItemGoingOut = isItemGoingOut;
exports.isItemOut = isItemOut;
exports.calculateLeftItem = calculateLeftItem;
exports.definedAction = definedAction;
exports.calculateAndRestoreItem = calculateAndRestoreItem;
exports.handleSelectedItem = handleSelectedItem;
