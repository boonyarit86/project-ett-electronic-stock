// Image
const hasImage = (img) =>
  Boolean(img?.public_id !== undefined && img?.url !== undefined);
const hasImageArray = (img) => Boolean(img?.length > 0);
const hasFile = (file) => file?.filename !== undefined;

// Item
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
  if(data.startsWith("เพิ่ม")) action = "add";
  return action;
}

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

exports.hasImage = hasImage;
exports.hasImageArray = hasImageArray;
exports.hasFile = hasFile;

exports.isNotItemGoingOut = isNotItemGoingOut;
exports.isItemGoingOut = isItemGoingOut;
exports.isItemOut = isItemOut;
exports.calculateLeftItem = calculateLeftItem;
exports.definedAction = definedAction;
exports.calculateAndRestoreItem = calculateAndRestoreItem;

