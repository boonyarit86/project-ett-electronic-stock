const historyExpire = (history) => {
  let expHistory = new Date(history.exp).getTime();
  let currentDate = new Date().getTime();
  return expHistory < currentDate;
}

const boardExist = (board) => board !== null; 
const toolExist = (tool) => tool !== null; 
const toolNotExist = (tool) => tool.length === 0; 
const avartarNotExist = (avartar) => avartar === "false";
const avartarExist = (avartar) => avartar === "true";
const fileExist = (file) => file !== undefined;
const imagesExist = (images) => images === "true";
const addDeletedAvartarToArray = (arr, avartar_id) => {
    arr.push(avartar_id);
}
const oldImagesExist = (images) => images.length !== 0;
const deletedImagesExist = (images) => images.length !== 0;
const addImageToDB = (arr, images) => [...arr, ...images];

  
exports.historyExpire = historyExpire;
exports.boardExist = boardExist;
exports.toolExist = toolExist;
exports.toolNotExist = toolNotExist;
exports.avartarExist = avartarExist;
exports.avartarNotExist = avartarNotExist; 
exports.fileExist = fileExist;
exports.imagesExist = imagesExist;
exports.addDeletedAvartarToArray = addDeletedAvartarToArray;
exports.oldImagesExist = oldImagesExist;
exports.deletedImagesExist = deletedImagesExist;
exports.addImageToDB = addImageToDB;
