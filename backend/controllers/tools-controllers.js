const Tool = require("../models/tool");
const Stt = require("../models/setting-tool-type");
const cloudinary = require("../utils/cloudinary");
const catchError = require("../utils/catchError");
const io = require("../index.js");
const {
  covertTypeandCateTool,
  covertTypeandCateTool2,
  covertTypeandCateTool3,
} = require("../utils/covertData");
const {
  createNotificationTool,
} = require("../utilsServer/notificationActions");
const { deleteImageInCloudinary } = require("../utils/handleImage");

const HistoryTool = require("../models/history-tool");
const HistoryCnt = require("../models/history-cnt");

// ------------- Helper functions --------------

async function orderDataFromNewestToOldest(histories, responseData) {
  for (let round = 0; round < histories.length; round++) {
    let history = histories[round];
    if (dataExist(history)) {
      if (historyExpire(history)) {
        await history.remove();
      } else {
        responseData.unshift(history);
      }
    }
  }

  function dataExist(history) {
    let dataType = history.tool !== undefined ? history.tool : history.board;
    return dataType !== null;
  }
}

function historyExpire(history) {
  let expHistory = new Date(history.exp).getTime();
  let currentDate = new Date().getTime();
  return expHistory < currentDate;
}

async function uploadImageToCloudinary(imagePath, tool) {
  await cloudinary.uploader.upload(imagePath, (error, result) => {
    if (error) res.status(401).send("ไม่สามารถอัพโหลดรูปภาพไปยังบนคลาวค์ได้");
    else {
      tool.avartar = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
  });
}

async function uploadMultipleImageToCloudinary(images, imageArr, avartarExist) {
  for (var round = 0; round < images.length; round++) {
    // not Avartar
    if (round === 0 && avartarExist) continue;
    else await uploadImage(images[round].path, imageArr);
  }

  async function uploadImage(imagePath, imageArr) {
    await cloudinary.uploader.upload(imagePath, (error, result) => {
      if (error) {
        console.log("can not upload image on clound");
      } else {
        imageArr.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    });
  }
}

async function sendDataToClient() {
  let tools = await Tool.find();
  let stt = await Stt.find();
  await covertTypeandCateTool(tools, stt);
  io.emit("tool-actions", tools);
}

function imageExist(image) {
  return image !== 0;
}

// ---------------- Main Functions ------------

// รับข้อมูลรายการอุปกรณ์ทั้งหมด
const getAllTools = async (req, res) => {
  try {
    let toolList = await Tool.find();
    let stt = await Stt.find();
    await covertTypeandCateTool(toolList, stt);
    res.status(200).json(toolList);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// รับข้อมูลการเบิกโปรเจคทั้งหมด
const getAllHistoryTools = async (req, res) => {
  try {
    let hists = await HistoryTool.find()
      .populate("tool")
      .populate("user")
      .populate("tags.user");

    let responseData = [];
    await orderDataFromNewestToOldest(hists, responseData);

    let stt = await Stt.find();
    await covertTypeandCateTool2(responseData, stt);

    res.status(200).json(responseData);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลประวัติรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// รับข้อมูลอุปกรณ์ที่ผู้ใช้เลือก
const getTool = async (req, res) => {
  try {
    let toolId = req.params.tid;
    let tool = await Tool.findById(toolId);
    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");
    let stt = await Stt.find();
    await covertTypeandCateTool3(tool, stt);
    res.status(200).json(tool);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// สร้างรายการอุปกรณ์
const createTool = async (req, res) => {
  const { toolName, toolCode, type, category, size, description } = req.body;

  try {
    let newTool = new Tool({
      toolName: toolName,
      toolCode: toolCode,
      type: type,
      category: category,
      size: size,
      total: 0,
      limit: 0,
      description: description,
    });

    if (req.file !== undefined) {
      await uploadImageToDB(req.file.path, newTool);
    }

    await newTool.save();

    let toolType = await Stt.findById(newTool.type);
    setToolType(toolType, newTool);
    setToolCategory(toolType, newTool);

    res.status(201).json(newTool);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถสร้างรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  function setToolType(toolType, newTool) {
    if (toolType) {
      newTool.type = toolType.type;
    } else {
      newTool.type = "";
    }
  }
  async function setToolCategory(toolType, newTool) {
    if (newTool.category !== "") {
      await toolType.categorys.map((item) => {
        if (item._id.toString() === newTool.category) {
          newTool.category = item.category;
        }
      });
    }
  }
};

// การเบิก/เพิ่มอุปกรณ์
const actionTool = async (req, res) => {
  const { total, description, actionType } = req.body;
  const toolId = req.params.tid;
  const toolTotal = Number(total);
  let newDate = new Date();

  if (toolTotal <= 0)
    return res.status(401).send("จำนวนอุปกรณ์ต้องมีค่าอย่างน้อย 1");

  try {
    let historyId = "614c2b3d246f3c25995dc745";
    let tool = await Tool.findById(toolId);
    let cnt = await HistoryCnt.findById(historyId);
    if (!cnt)
      return res
        .status(401)
        .send("ไม่สามารถกำหนดเลขที่การเบิกได้ โปรดลองทำรายการอีกครั้ง");
    if (!tool)
      return res.status(401).send("รายการอุปกรณ์นี้ไม่มีอยู่ในฐานข้อมูล");
    if (actionType === "เพิ่ม") {
      increaseTool(tool, toolTotal);
      setToolStatus(tool);
    } else {
      if (toolInStockEnough(tool.total, toolTotal))
        return res.status(401).send("จำนวนอุปกรณ์ที่เบิกมีมากกว่าในสต๊อก");
      decreaseTool(tool, toolTotal);
      await createNotificationTool(tool);
    }

    let newHistoryTool = new HistoryTool({
      code: `${cnt.name}${cnt.cntNumber}`,
      tool: toolId,
      user: req.userId,
      total: toolTotal,
      actionType: actionType,
      date: newDate,
      exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
      description: description,
      tags: [
        {
          user: req.userId,
          code: `${cnt.name}${cnt.cntNumber}-1`,
          action: actionType,
          total: toolTotal,
          date: newDate,
          description: description,
        },
      ],
    });

    cnt.cntNumber = cnt.cntNumber + 1;

    await tool.save();
    await newHistoryTool.save();
    await cnt.save();

    await sendDataToClient();

    res.status(200).send({});
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถทำรายการได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  function increaseTool(toolInStock, newToolTotal) {
    toolInStock.total = toolInStock.total + newToolTotal;
  }
  function setToolStatus(tool) {
    if (tool.total > tool.limit) {
      tool.isAlert = false;
    }
  }
  function toolInStockEnough(toolInStock, newToolTotal) {
    return toolInStock < newToolTotal;
  }
  function decreaseTool(toolInStock, newToolTotal) {
    toolInStock.total = toolInStock.total - newToolTotal;
  }
};

// การแก้ไขรายการอุปกรณ์
const editTool = async (req, res) => {
  const {
    toolName,
    toolCode,
    type,
    category,
    size,
    images,
    avartar,
    description,
    limit,
  } = req.body;
  const oldImages = JSON.parse(req.body.oldImages);
  const delImages = JSON.parse(req.body.delImages);
  let newImgArr = [];

  // ตัวแปรรูปภาพที่จะถูกลบ
  let delImgArr = [];
  let toolId = req.params.tid;

  if (Number(limit) < 0)
    return res.status(401).send("จำนวนตัวเลขการแจ้งเตือนต้องมีค่าอย่างน้อย 1");

  try {
    let tool = await Tool.findById(toolId);
    let previousAvartar_id = tool.avartar.public_id;

    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");

    tool.toolName = toolName;
    tool.toolCode = toolCode;
    tool.type = type;
    tool.size = size;
    tool.limit = limit;
    tool.category = category;
    tool.description = description;

    if (avartarNotExist(avartar)) {
      deletePreviousImage(tool, delImgArr);
    } else if (avartarExist(avartar)) {
      if (previousAvartar_id) {
        addDeletedAvartarToArray(delImgArr, previousAvartar_id);
      }
      await uploadImageToCloudinary(req.files[0].path, tool);
    }

    if (imagesExist(images)) {
      // ทำการแยกรูปภาพโปรไฟล์อุปกรณ์ออกจากรายการ ถ้ามี
      if (avartarExist(avartar)) {
        await uploadMultipleImageToCloudinary(req.files, newImgArr, true);
      } else {
        await uploadMultipleImageToCloudinary(req.files, newImgArr, false);
      }
    }

    if (oldImagesExist(oldImages)) {
      newImgArr = addImageToDB(newImgArr, oldImages);
    }

    if (deletedImagesExist(delImages)) {
      for (var x = 0; x < delImages.length; x++) {
        delImgArr = [...delImgArr, delImages[x].public_id];
      }
    }
    tool.images = newImgArr;

    // ลบรูปภาพออกจากระบบ
    if (deletedImagesExist(delImgArr)) {
      for (var i = 0; i < delImgArr.length; i++) {
        await deleteImageInCloudinary(delImgArr[i]);
      }
    }

    await tool.save();
    res.status(200).json(tool);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถแก้ไขรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  // ------------- Helper Functions --------------------

  function deletePreviousImage(tool, deletedImageArr) {
    // ลบรูปภาพเดิมออกแล้วเพิ่มรูปภาพระบบไปแทน
    let avartar_id = tool.avartar.public_id;
    if (avartar_id) {
      addDeletedAvartarToArray(deletedImageArr, avartar_id);
      tool.avartar = {};
    }
  }

  function avartarNotExist(avartar) {
    return avartar === "false";
  }

  function avartarExist(avartar) {
    return avartar === "true";
  }

  function addDeletedAvartarToArray(arr, avartar_id) {
    arr.push(avartar_id);
  }

  function imagesExist(images) {
    return images === "true";
  }

  function oldImagesExist(images) {
    return images.length !== 0;
  }

  function deletedImagesExist(images) {
    return images.length !== 0;
  }

  function addImageToDB(arr, images) {
    return [...arr, ...images];
  }
};

// ยกเลิกการเบิกอุปกรณ์
const restoreTool = async (req, res) => {
  const { htid, tid, description } = req.body;

  try {
    let tool = await Tool.findById(tid);
    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");

    let hist = await HistoryTool.findById(htid);
    if (!hist)
      return res
        .status(401)
        .send("ไม่พบข้อมูลประวัติรายการอุปกรณ์นี้ในฐานข้อมูล");

    if (hist.actionType === "เพิ่ม") {
      if (tool.total < hist.total)
        return res
          .status(401)
          .send("จำนวนอุปกรณ์ในสต๊อกมีน้อยกว่า ไม่สามารถหักลบค่าได้");

      tool.total = tool.total - hist.total;

      await createNotificationTool(tool);
    } else {
      tool.total = tool.total + hist.total;

      if (tool.total > tool.limit) {
        tool.isAlert = false;
      }
    }

    let newTag = {
      user: req.userId,
      code: `${hist.code}-${hist.tags.length + 1}`,
      action: "คืนสต๊อก",
      total: hist.total,
      date: new Date(),
      description: description,
    };

    hist.total = 0;
    await hist.tags.unshift(newTag);

    await tool.save();
    await hist.save();

    let hists = await HistoryTool.find()
      .populate("tool")
      .populate("user")
      .populate("tags.user");

    // Sort from latest date to oldest date and Check expairation of data.
    let responseData = [];
    for (var round = 0; round < hists.length; round++) {
      if (toolIdExist(hists[round].tool)) {
        if (historyExpire(hists[round])) {
          await hists[round].remove();
        } else {
          responseData.unshift(hists[round]);
        }
      }
    }

    let stt = await Stt.find();
    await covertTypeandCateTool2(responseData, stt);
    await sendDataToClient();

    res.status(200).json(responseData);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถคืนอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  function toolIdExist(toolId) {
    return toolId !== null;
  }
};

// ลบรายการอุปกรณ์
const deleteTool = async (req, res) => {
  let toolId = req.params.tid;

  try {
    let tool = await Tool.findById(toolId);
    let avartar_id = tool.avartar.public_id;

    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");

    // ลบรูปภาพของอุปกรณ์
    if (imageExist(tool.images.length)) {
      for (var i = 0; i < tool.images.length; i++) {
        await deleteImageInCloudinary(tool.images[i].public_id);
      }
    }

    // ลบรูปภาพโปรไฟล์ของอุปกรณ์
    if (avartar_id) {
      await deleteImageInCloudinary(avartar_id);
    }

    await tool.remove();
    await sendDataToClient();

    res.status(200).send("delete success");
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถลบรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

exports.editTool = editTool;
exports.getAllTools = getAllTools;
exports.getAllHistoryTools = getAllHistoryTools;
exports.getTool = getTool;
exports.actionTool = actionTool;
exports.createTool = createTool;
exports.restoreTool = restoreTool;
exports.deleteTool = deleteTool;


// router.post('/', async (req, res) => {
//   try {
//     const order = new Order(req.body)
//     await order.save()
//     const orders = await Order.find()
//     io.emit('order-added', orders)
//     res.status(201).send(order)
//   } catch (error) {
//     res.send(error)
//   }
// })
