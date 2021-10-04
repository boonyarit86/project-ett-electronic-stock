const Tool = require("../models/tool");
const Stt = require("../models/setting-tool-type");
const Notification = require("../models/notification");
const cloudinary = require("../utils/cloudinary");
const io = require("../index.js");
const {
  covertTypeandCateTool2,
  covertTypeandCateTool3,
} = require("../utils/covertData");
const { createNotificationTool } = require("../utilsServer/notificationActions");

const HistoryTool = require("../models/history-tool");
const HistoryCnt = require("../models/history-cnt");
// const Board = require("../models/board");
// const HistoryBoard = require("../models/history-board");
// const IncompleteTool = require("../models/incomplete-tool");
// const historyTool = require('../models/history-tool');

// ** -- Public Function -- **
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

// ** -- Public Function -- **

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
const getAllHistoryTools = async (req, res) => {
  try {
    let hists = await HistoryTool.find()
      .populate("tool")
      .populate("user")
      .populate("tags.user");

    // Sort from latest date to oldest date and Check expairation of data.
    let responseData = [];
    for (var round = 0; round < hists.length; round++) {
      if (hists[round].tool !== null) {
        let expHistory = new Date(hists[round].exp).getTime();
        let currentDate = new Date().getTime();
        if (expHistory < currentDate) {
          await hists[round].remove();
        } else {
          responseData.unshift(hists[round]);
        }
      }
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "ไม่สามารถเรียกข้อมูลประวัติรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง"
      );
  }
};

// รับข้อมูลอุปกรณ์ที่ผู้ใช้เลือก
const getTool = async (req, res) => {
  try {
    let tool = await Tool.findById(req.params.tid);
    if (!tool)
      return res.status(401).send("ไม่พบข้อมูลรายการอุปกรณ์ในฐานข้อมูล");
    let stt = await Stt.find();
    covertTypeandCateTool3(tool, stt);
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
    let cnt = await HistoryCnt.findById("614c2b3d246f3c25995dc745");
    if (!cnt)
      return res
        .status(401)
        .send("ไม่สามารถกำหนดเลขที่การเบิกได้ โปรดลองทำรายการอีกครั้ง");
    if (!tool)
      return res.status(401).send("รายการอุปกรณ์นี้ไม่มีอยู่ในฐานข้อมูล");
    if (actionType === "เพิ่ม") {
      tool.total = tool.total + toolTotal;
    } else {
      if (tool.total < toolTotal)
        return res.status(401).send("จำนวนอุปกรณ์ที่เบิกมีมากกว่าในสต๊อก");
      tool.total = tool.total - toolTotal;
      await createNotificationTool(tool)
    }

    let newHistoryTool = new HistoryTool({
      code: `${cnt.name}${cnt.cntNumber}`,
      tool: toolId,
      user: req.userId,
      total: toolTotal,
      actionType: actionType,
      date: new Date(),
      exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
      description: description,
      tags: [
        {
          user: req.userId,
          code: `${cnt.name}${cnt.cntNumber}-1`,
          action: actionType,
          total: toolTotal,
          date: new Date(),
          description: description,
        },
      ],
    });

    cnt.cntNumber = cnt.cntNumber + 1;

    // await tool.save();
    // await newHistoryTool.save();
    // await cnt.save();
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
    } else {
      tool.total = tool.total + hist.total;
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
      if (hists[round].tool !== null) {
        let expHistory = new Date(hists[round].exp).getTime();
        let currentDate = new Date().getTime();
        if (expHistory < currentDate) {
          await hists[round].remove();
        } else {
          responseData.unshift(hists[round]);
        }
      }
    }

    let tools = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).send("ไม่สามารถคืนอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
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
  } catch (error) {
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
exports.restoreTool = restoreTool;
exports.deleteTool = deleteTool;
