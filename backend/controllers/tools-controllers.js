const Tool = require("../models/tool");
const Stt = require("../models/setting-tool-type");
const cloudinary = require("../utils/cloudinary");
const io = require("../index.js");

// const HistoryTool = require("../models/history-tool");
// const HistoryCnt = require("../models/history-cnt");
// const Board = require("../models/board");
// const HistoryBoard = require("../models/history-board");
// const IncompleteTool = require("../models/incomplete-tool");
// const historyTool = require('../models/history-tool');

const covertTypeandCateTool = async (tools, stt) => {
  let arrTool = await tools.map((item) => {
    let data = stt.find((x) => x._id.toString() === item.type);
    if (data) {
      let cate = data.categorys.find((x) => x._id.toString() === item.category);
      if (cate) {
        item.category = cate.category;
      } else {
        item.category = "ไม่ได้กำหนด";
      }
      item.type = data.type;
      return item;
    } else {
      item.type = "ไม่ได้กำหนด";
      item.category = "ไม่ได้กำหนด";
      return item;
    }
    // return item
  });
  // console.log(arrTool)
  return arrTool;
};

// รับข้อมูลรายการอุปกรณ์ทั้งหมด
const getAllTools = async (req, res) => {
  // console.log(io)
  try {
    let toolLists = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(toolLists, stt);
    res.status(200).json(toolLists);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถเรียกข้อมูลรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// รับข้อมูลการเบิกโปรเจคทั้งหมด
const getAllHistoryTools = async (req, res, next) => {
  let historyTools;
  let userStatus = req.body.status;
  let userName = req.body.userName;
  try {
    historyTools = await HistoryTool.find();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not fetching history tool.",
      500
    );
    return next(error);
  }

  // ลบข้อมูลที่หมดอายุ
  for (var round = 0; round < historyTools.length; round++) {
    let expHistory = new Date(historyTools[round].exp).getTime();
    let currentDate = new Date().getTime();
    if (expHistory < currentDate) {
      try {
        await historyTools[round].remove();
      } catch (err) {
        const error = new HttpError(
          "Something went wrong, could not remove history-tool that expired.",
          500
        );
        return next(error);
      }
    }
  }

  // รายการอุปกรณ์ไหนที่ถูกลบไปแล้ว จะไปแสดงผลในหน้าประวัติการใช้งานอุปกรณ์ด้วย แต่จะเก็บไว้ในฐานข้อมูลอย่างเดียว
  // ตรวจสอบว่าผู้ใช้สถานะไหนเป็นคนขอข้อมูล
  let filterData;
  if (userStatus === "User") {
    filterData = historyTools.filter(
      (item) => item.isDeleted !== true && item.username === userName
    );
  } else {
    filterData = historyTools.filter((item) => item.isDeleted !== true);
  }

  // เรียงลำดับข้อมูล โดยเอาวันที่ล่าสุดขึ้นมาก่อน
  let responseData = [];
  for (var round = 0; round < filterData.length; round++) {
    let index = filterData.length - 1 - round;
    responseData = [...responseData, filterData[index]];
  }

  res.json(responseData);
};

// รับข้อมูลอุปกรณ์ที่ผู้ใช้เลือก
const getTool = async (req, res) => {
  try {
    let tool = await Tool.findById(req.params.tid);
    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");
    res.status(200).json(tool);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถเรียกข้อมูลรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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
      await cloudinary.uploader.upload(req.file.path, (error, result) => {
        if (error)
          res.status(401).send("ไม่สามารถอัพโหลดรูปภาพไปยังบนคลาวค์ได้");
        else {
          newTool.avartar = {
            url: result.secure_url,
            public_id: result.public_id,
          };
        }
      });
    }

    await newTool.save();

    let toolType = await Stt.findById(newTool.type);
    if (toolType) {
      newTool.type = toolType.type;
    } else {
      newTool.type = "";
    }

    if (newTool.category !== "") {
      await toolType.categorys.map((item) => {
        if (item._id.toString() === newTool.category) {
          newTool.category = item.category;
        }
      });
    }

    // console.log(newTool);
    res.status(201).json(newTool);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถสร้างรายการอุปกรณ์ใหม่ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// การเบิก/เพิ่มอุปกรณ์
const actionTool = async (req, res) => {
  const { total, description, actionType } = req.body;
  const toolId = req.params.tid;
  const toolTotal = Number(total);
  if (toolTotal <= 0)
    return res.status(401).send("จำนวนอุปกรณ์ต้องมีค่าอย่างน้อย 1");

  try {
    let tool = await Tool.findById(toolId);
    if (!tool)
      return res.status(401).send("รายการอุปกรณ์นี้ไม่มีอยู่ในฐานข้อมูล");
    if (actionType === "เพิ่ม") {
      tool.total = tool.total + toolTotal;
    } else {
      if (tool.total < toolTotal)
        return res.status(401).send("จำนวนอุปกรณ์ที่เบิกมีมากกว่าในสต๊อก");
      tool.total = tool.total - toolTotal;
    }

    await tool.save();
    let tools = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);
    res.status(200).send(tools);
  } catch (error) {
    console.log(error);
    res.status(500).send("ไม่สามารถทำรายการได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

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
    oldImages,
    delImages,
    limit,
  } = req.body;
  // ตัวแปรรูปภาพที่จะถูกลบ
  let delImgArr = [];

  if (Number(limit) <= 0)
    return res.status(401).send("จำนวนต้องมีค่าอย่างน้อย 1");

  try {
    let tool = await Tool.findById(req.params.tid);
    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");

    tool.toolName = toolName;
    tool.toolCode = toolCode;
    tool.type = type;
    tool.size = size;
    tool.limit = limit;
    tool.category = category;
    tool.description = description;

    // อัพโหลดโปรไฟล์อุปกรณ์
    // ถ้ารูปอุปกรณ์ถูกลบหรือไม่ได้กำหนดมา
    if (avartar === "false") {
      // ลบรูปภาพเดิมออกแล้วเพิ่มรูปภาพระบบไปแทน
      if (tool.avartar.public_id) {
        delImgArr = [...delImgArr, tool.avartar.public_id];
        tool.avartar = {};
        // console.log("set default image and delete");
      }
    }
    // ผู้ใช้งานกำหนดรูปภาพใหม่
    else if (avartar === "true") {
      // ถ้ามีรูปเก่าในระบบให้ลบ และเพิ่มรุปภาพใหม่เข้าไป
      if (tool.avartar.public_id) {
        delImgArr = [...delImgArr, tool.avartar.public_id];
        await cloudinary.uploader.upload(req.files[0].path, (error, result) => {
          if (error) console.log("can not upload image on clound");
          tool.avartar = {
            public_id: result.public_id,
            url: result.secure_url,
          };
        });
      }
      // ถ้าไม่มีรุปภาพเก่าในระบบ ให้เพิ่มอย่างเดียว
      else {
        console.log("add only image to db");
        await cloudinary.uploader.upload(req.files[0].path, (error, result) => {
          if (error) console.log("can not upload image on clound");
          tool.avartar = {
            public_id: result.public_id,
            url: result.secure_url,
          };
        });
      }
    }
    // Multi Images
    let newImgArr = [];
    // ถ้ามีรูปภาพใหม่ที่อัพมา มากกว่า 1
    if (images === "true") {
      // console.log("have images");
      // ทำการแยกรูปภาพโปรไฟล์อุปกรณ์ออกจากรายการ ถ้ามี
      if (avartar === "true") {
        for (var round = 0; round < req.files.length; round++) {
          if (round !== 0) {
            await cloudinary.uploader.upload(
              req.files[round].path,
              (error, result) => {
                if (error) {
                  console.log("can not upload image on clound");
                } else {
                  newImgArr = [
                    ...newImgArr,
                    {
                      url: result.secure_url,
                      public_id: result.public_id,
                    },
                  ];
                }
              }
            );
          }
        }
      } else {
        // console.log("Only many imges");
        for (var round1 = 0; round1 < req.files.length; round1++) {
          await cloudinary.uploader.upload(
            req.files[round1].path,
            (error, result) => {
              if (error) console.log("can not upload image on clound");
              newImgArr = [
                ...newImgArr,
                {
                  public_id: result.public_id,
                  url: result.secure_url,
                },
              ];
            }
          );
        }
      }
      // เพิ่มรุปภาพเก่าไปยังที่เดิม
      if (JSON.parse(oldImages).length !== 0) {
        let convOldImages = JSON.parse(oldImages);
        newImgArr = [...newImgArr, ...convOldImages];
      }

      if (JSON.parse(delImages).length !== 0) {
        // console.log("delete images section 1");
        let convDelImages = JSON.parse(delImages);
        for (var x = 0; x < convDelImages.length; x++) {
          delImgArr = [...delImgArr, convDelImages[x].public_id];
        }
      }
      tool.images = newImgArr;
    }
    // ถ้าไม่มีรูปภาพที่อัพมาใหม่ แต่เป็นรูปภาพเก่าที่ถูกลบจากฐานข้อมูล
    else {
      // console.log("have no images");
      // เพิ่มรุปภาพเก่าไปยังที่เดิม
      if (JSON.parse(oldImages).length !== 0) {
        let convOldImages = JSON.parse(oldImages);
        newImgArr = [...newImgArr, ...convOldImages];
      }

      if (JSON.parse(delImages).length !== 0) {
        // console.log("delete images section 2");
        let convDelImages = JSON.parse(delImages);
        for (var x = 0; x < convDelImages.length; x++) {
          delImgArr = [...delImgArr, convDelImages[x].public_id];
        }
      }
      tool.images = newImgArr;
    }

    // ลบรูปภาพออกจากระบบ
    if (delImgArr.length !== 0) {
      for (var i = 0; i < delImgArr.length; i++) {
        await cloudinary.uploader.destroy(delImgArr[i], (error, res) => {
          if (error) console.log("can not delete image");
          else console.log("delete image");
        });
      }
    }
    console.log(tool);
    await tool.save();
    res.status(200).json(tool);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถแก้ไขรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// ยกเลิกการเบิกอุปกรณ์
const editHistoryTool = async (req, res, next) => {
  const { htid, username, status, total, description } = req.body;

  let findTool;
  let findHistoryTool;

  // หาข้อมูลอุปกรณ์
  try {
    findTool = await Tool.findById(req.params.tid);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find tool by id.",
      500
    );
    return next(error);
  }

  // หาข้อมูลประวัติการเบิกอุปกรณ์
  try {
    findHistoryTool = await HistoryTool.findById(htid);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find history-tool by id.",
      500
    );
    return next(error);
  }

  let newTag;
  let calTotal;
  // แก้ไขกระบวนการทำงานของ การเพิ่ม
  if (findHistoryTool.actionType === "add") {
    // 10 - 8 = 2 ก็คือ สต๊อกถูกลดค่า
    if (findHistoryTool.total > Number(total)) {
      calTotal = findHistoryTool.total - Number(total);
      findTool.total = findTool.total - calTotal;
    }
    // 10 - 15 = -5 ก็คือ สต๊อกถูกเพิ่มค่า
    else if (findHistoryTool.total < Number(total)) {
      calTotal = Number(total) - findHistoryTool.total;
      findTool.total = findTool.total + calTotal;
    }
    newTag = {
      code: findHistoryTool.code + "-2",
      username: username,
      total: total,
      status: status,
      date: new Date().toString(),
      description: description,
      actionType: findHistoryTool.actionType,
    };
  }
  // แก้ไขกระบวนการทำงานของ การเบิก
  else if (findHistoryTool.actionType === "request") {
    // ตรวจสอบว่าเป็นกระบวนการ Restore ของคืนสต๊อกรึป่าว
    if (Number(total) !== 0) {
      // 10 - 8 = 2 ก็คือ สต๊อกถูกเพิ่มค่า
      if (findHistoryTool.total > Number(total)) {
        calTotal = findHistoryTool.total - Number(total);
        findTool.total = findTool.total + calTotal;
      }
      // 10 - 15 = 5 ก็คือ สต๊อกถูกลดค่า
      else if (findHistoryTool.total < Number(total)) {
        calTotal = Number(total) - findHistoryTool.total;
        findTool.total = findTool.total - calTotal;
      }
    } else {
      findTool.total = findTool.total + findHistoryTool.total;
    }
  }

  // สร้างข้อมูลแท๊กใหม่
  let newActionType;
  if (Number(total) !== 0) {
    newActionType = findHistoryTool.actionType;
  } else {
    newActionType = "restore";
  }
  newTag = {
    code: findHistoryTool.code + "-2",
    username: username,
    total: total,
    status: status,
    date: new Date().toString(),
    description: description,
    actionType: newActionType,
  };

  // เริ่มเก็บข้อมูล
  findHistoryTool.total = total;
  findHistoryTool.actionEdit = [...findHistoryTool.actionEdit, newTag];

  try {
    await findTool.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not save data tool.",
      500
    );
    return next(error);
  }

  try {
    await findHistoryTool.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not save data tool.",
      500
    );
    return next(error);
  }
  let historyTool = await HistoryTool.find();
  res.status(201).json(historyTool);
  console.log("restore tool successfully");
  // console.log(findHistoryTool)
  // console.log(findTool)
};

// ลบรายการอุปกรณ์
const deleteTool = async (req, res) => {
  let toolId = req.params.tid;

  // หาข้อมูลอุปกรณ์
  try {
    let tool = await Tool.findById(toolId);
    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");

    // ลบรูปภาพของอุปกรณ์
    if (tool.images.length !== 0) {
      for (var i = 0; i < tool.images.length; i++) {
        await cloudinary.uploader.destroy(
          tool.images[i].public_id,
          (error, res) => {
            if (error) console.log("can not delete image");
            else console.log("delete images");
          }
        );
      }
    }

    // ลบรูปภาพโปรไฟล์ของอุปกรณ์
    if (tool.avartar.public_id) {
      await cloudinary.uploader.destroy(
        tool.avartar.public_id,
        (error, res) => {
          if (error) console.log("can not delete image");
          else console.log("delete image");
        }
      );
    }

    await tool.remove();

    let tools = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);

    res.status(200).send("delete success");
  } catch (err) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถแก้ไขรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

exports.editTool = editTool;
exports.getAllTools = getAllTools;
exports.getAllHistoryTools = getAllHistoryTools;
exports.getTool = getTool;
exports.actionTool = actionTool;
exports.createTool = createTool;
exports.editHistoryTool = editHistoryTool;
exports.deleteTool = deleteTool;
