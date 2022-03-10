const Tool = require("../models/tool");
const Stt = require("../models/setting-tool-type");
const cloudinary = require("../utils/cloudinary");
const catchError = require("../utils/catchError");
const io = require("../index.js");
const {
  orderData,
  covertTypeandCateTool,
  covertTypeandCateTool2,
  covertTypeandCateTool4,
  covertHistoryBoardByCheckingDate,
} = require("../utils/covertData");
const {
  boardExist,
  toolExist,
  toolNotExist,
  fileExist,
  avartarNotExist,
  avartarExist,
  imagesExist,
  addDeletedAvartarToArray,
  oldImagesExist,
  deletedImagesExist,
  addImageToDB,
} = require("../utils/index");
const {
  uploadMultipleImageToCloudinary,
  deleteImageInCloudinary,
} = require("../utils/handleImage");

const HistoryTool = require("../models/history-tool");
const HistoryBoard = require("../models/history-board");
const HistoryCnt = require("../models/history-cnt");
const Board = require("../models/board");
const InsufficientTool = require("../models/incomplete-tool");
const {
  createNotificationTool,
  createNotificationBoard,
} = require("../utilsServer/notificationActions");

// ------------------- Helper Function -------------------

async function uploadImageToCloudinary(imagePath, board) {
  await cloudinary.uploader.upload(imagePath, (error, result) => {
    if (error) console.log("can not upload image on clound");
    else {
      board.avartar = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
  });
}
async function sendDataToClient() {
  let boards = await Board.find();
  io.emit("board-actions", boards);
  let tools = await Tool.find();
  let stt = await Stt.find();
  await covertTypeandCateTool(tools, stt);
  io.emit("tool-actions", tools);
}
function setBoardStatus(board) {
  if (board.total > board.limit) {
    board.isAlert = false;
  }
}
function decreaseBoard(boardInStock, usedBoard) {
  boardInStock.total = boardInStock.total - usedBoard;
}
function increaseBoard(boardInStock, newBoardTotal) {
  boardInStock.total = boardInStock.total + newBoardTotal;
}

// ----------------- Main Function -------------------------

// รับข้อมูลบอร์ดทั้งหมด
const getAllBoards = async (req, res) => {
  try {
    let boardLists = await Board.find().populate("tools.tool");
    res.status(200).json(boardLists);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// รับข้อมูลบอร์ดที่ผู้ใช้เลือก
const getBoard = async (req, res) => {
  let newToolArr = [];

  try {
    let boardId = req.params.bid;
    let board = await Board.findById(boardId);

    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    // Are those data available ?. if not, delete immaditly it.
    await prepareUsedTool(board);
    await setUsedToolInBoard(board);

    let stt = await Stt.find();
    let data = await Board.find({ _id: boardId }).populate("tools.tool");
    await covertTypeandCateTool2(data[0].tools, stt);
    res.status(200).json(data[0]);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function prepareUsedTool(board) {
    for (let r = 0; r < board.tools.length; r++) {
      let tool = await Tool.findById(board.tools[r].tool);
      if (tool) {
        newToolArr.push(board.tools[r]);
      }
    }
  }
  async function setUsedToolInBoard(board) {
    if (newToolArr.length !== board.tools.length) {
      board.tools = newToolArr;
      await board.save();
    }
  }
};

// รับข้อมูลการเบิกบอร์ดทั้งหมด
const getAllHistoryBoards = async (req, res) => {
  try {
    let hisbs = await HistoryBoard.find()
      .populate("board")
      .populate("user")
      .populate("tags.user");

    // Sort from latest date to oldest date and Check expairation of data.
    let responseData = [];
    await covertHistoryBoardByCheckingDate(hisbs, responseData);
    res.status(200).json(responseData);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลประวัติรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// รับข้อมูลอุปกรณ์คงค้าง
const getIncompleteTool = async (req, res) => {
  try {
    let lists = await InsufficientTool.find()
      .populate("board")
      .populate("user")
      .populate("hisb")
      .populate("tools.tool");
    let stt = await Stt.find();

    // Checking if a tool is deleted.
    for (let r = 0; r < lists.length; r++) {
      let newToolArr = [];
      let list = await InsufficientTool.findById(lists[r]._id)
        .populate("board")
        .populate("user")
        .populate("hisb")
        .populate("tools.tool");

      if (boardExist(list.board)) {
        for (let r2 = 0; r2 < list.tools.length; r2++) {
          if (toolExist(list.tools[r2].tool)) {
            newToolArr.push(list.tools[r2]);
          }
        }

        list.tools = newToolArr;

        if (toolNotExist(list.tools)) {
          await list.remove();
        } else {
          await list.save();
        }
      } else {
        await list.remove();
      }
    }

    // Prepare sending data
    let responseData = await InsufficientTool.find()
      .populate("board")
      .populate("user")
      .populate("hisb")
      .populate("tools.tool");
    let newData = await orderData(responseData);

    if (newData.length !== 0) {
      await covertTypeandCateTool4(newData, stt);
    }
    res.status(200).json(newData);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }
};

// สร้างรายการบอร์ด
const createBoard = async (req, res) => {
  const { boardName, boardCode, type, description } = req.body;
  let newToolsArr = [];

  try {
    let tools = JSON.parse(req.body.tools);

    await prepareTool(tools);

    let newBoard = new Board({
      boardName: boardName,
      boardCode: boardCode,
      type: type,
      tools: newToolsArr,
      total: 0,
      limit: 0,
      description: description,
    });

    if (fileExist(req.file)) {
      await uploadImageToCloudinary(req.file.path, newBoard);
    }

    await newBoard.save();

    res.status(201).json(newBoard);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถสร้างรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function prepareTool(tools) {
    for (let r = 0; r < tools.length; r++) {
      let tool = await Tool.findById(tools[r]._id);
      if (tool) {
        newToolsArr.push({ tool: tools[r]._id, total: Number(tools[r].total) });
      }
    }
  }
};

// การเบิก/เพิ่มบอร์ด
const actionBoard = async (req, res) => {
  // Tool: 614c2b3d246f3c25995dc745
  // Board: 614c2b490e1240c5f3e5a6c5
  const { total, description, actionType } = req.body;
  const boardId = req.params.bid;
  const boardTotal = Number(total);
  let newDate = new Date();

  if (boardTotal <= 0)
    return res.status(401).send("จำนวนบอร์ดต้องมีค่าอย่างน้อย 1");

  try {
    let board = await Board.findById(boardId);
    let cntBoard = await HistoryCnt.findById("614c2b490e1240c5f3e5a6c5");
    if (!cntBoard)
      return res
        .status(401)
        .send("ไม่สามารถกำหนดเลขที่การเบิกได้ โปรดลองทำรายการอีกครั้ง");
    if (!board)
      return res.status(401).send("รายการบอร์ดนี้ไม่มีอยู่ในฐานข้อมูล");

    await processRequestBoard(board);

    let newHistoryBoard = new HistoryBoard({
      code: `${cntBoard.name}${cntBoard.cntNumber}`,
      board: boardId,
      user: req.userId,
      total: boardTotal,
      actionType: actionType,
      date: newDate,
      exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
      description: description,
      tags: [
        {
          user: req.userId,
          code: `${cntBoard.name}${cntBoard.cntNumber}-1`,
          action: actionType,
          total: boardTotal,
          date: newDate,
          description: description,
        },
      ],
    });

    cntBoard.cntNumber = cntBoard.cntNumber + 1;

    await board.save();
    await newHistoryBoard.save();
    await cntBoard.save();

    let boards = await Board.find();
    io.emit("board-actions", boards);
    res.status(200).send(boards);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถทำรายการได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function processRequestBoard(board) {
    if (actionType === "เพิ่ม") {
      increaseBoard(board, boardTotal);
      setBoardStatus(board);
    } else {
      if (boardInStockEnough(board.total, boardTotal))
        return res.status(401).send("จำนวนบอร์ดที่เบิกมีมากกว่าในสต๊อก");
      decreaseBoard(board, boardTotal);
      await createNotificationBoard(board);
    }
  }
  function boardInStockEnough(boardInStock, newBoardTotal) {
    return boardInStock < newBoardTotal;
  }
};

// แก้ไขข้อมูลบอร์ด
const editBoard = async (req, res) => {
  const { boardName, boardCode, type, images, avartar, description, limit } =
    req.body;
  const oldImages = JSON.parse(req.body.oldImages);
  const delImages = JSON.parse(req.body.delImages);
  let newImgArr = [];
  let delImgArr = [];
  let newToolsArr = [];
  let tools = JSON.parse(req.body.tools);

  if (Number(limit) < 0)
    return res.status(401).send("จำนวนตัวเลขการแจ้งเตือนต้องมีค่าอย่างน้อย 1");

  try {
    let board = await Board.findById(req.params.bid);
    let previousAvartar_id = board.avartar.public_id;

    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    await prepareUsedTool();
    setBoardData();
    await handleImages(board, previousAvartar_id);

    await board.save();
    res.status(200).json(board);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถแก้ไขรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function prepareUsedTool() {
    for (let r = 0; r < tools.length; r++) {
      let tool = await Tool.findById(tools[r]._id);
      if (tool) {
        newToolsArr = [
          ...newToolsArr,
          { tool: tools[r]._id, total: Number(tools[r].total) },
        ];
      }
    }
  }

  function setBoardData(board) {
    board.boardName = boardName;
    board.boardCode = boardCode;
    board.type = type;
    board.limit = limit;
    board.description = description;
    board.tools = newToolsArr;
  }

  async function handleImages(board, previousAvartar_id) {
    // ถ้ารูปอุปกรณ์ถูกลบหรือไม่ได้กำหนดมา
    if (avartarNotExist(avartar)) {
      deletePreviousImage(board, delImgArr);
    }
    // ผู้ใช้งานกำหนดรูปภาพใหม่
    else if (avartarExist(avartar)) {
      if (previousAvartar_id) {
        addDeletedAvartarToArray(delImgArr, previousAvartar_id);
      }
      await uploadImageToCloudinary(req.files[0].path, board);
    }

    if (imagesExist(images)) {
      let isAvartar = false;
      if (avartarExist(avartar)) {
        isAvartar = true;
      }
      await uploadMultipleImageToCloudinary(req.files, newImgArr, isAvartar);
    }

    if (oldImagesExist(oldImages)) {
      newImgArr = addImageToDB(newImgArr, oldImages);
    }

    if (deletedImagesExist(delImages)) {
      for (var x = 0; x < delImages.length; x++) {
        delImgArr = [...delImgArr, delImages[x].public_id];
      }
    }

    board.images = newImgArr;

    // ลบรูปภาพออกจากระบบ
    if (deletedImagesExist(delImgArr.length)) {
      for (var i = 0; i < delImgArr.length; i++) {
        await deleteImageInCloudinary(delImgArr[i]);
      }
    }
  }

  function deletePreviousImage(board, deletedImageArr) {
    // ลบรูปภาพเดิมออกแล้วเพิ่มรูปภาพระบบไปแทน
    let avartar_id = board.avartar.public_id;
    if (avartar_id) {
      addDeletedAvartarToArray(deletedImageArr, avartar_id);
      board.avartar = {};
    }
  }
};

// การเบิกบอร์ด
const requestBoard = async (req, res) => {
  const { msgs, description } = req.body;
  let newDate = new Date();
  let usedToolList = [];
  let incompleteToolList = [];
  let boardId = msgs.success.board._id;
  let actionType = "เบิกอุปกรณ์พร้อมบอร์ด";
  let insuffTool_id = null;
  let newInsuffiTool = null;

  if (usedToolNotExist(msgs)) {
    return res
      .status(401)
      .send("ไม่สามารถทำรายการได้ เนื่องจากไม่มีรายการอุปกรณ์อยู่ในบอร์ดนี้");
  }
  try {
    let board = await Board.findById(boardId);

    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    board.total = msgs.success.board.boardInStock;

    let cntBoard = await HistoryCnt.findById("614c2b490e1240c5f3e5a6c5");
    let cntTool = await HistoryCnt.findById("614c2b3d246f3c25995dc745");

    if (!cntBoard || !cntTool)
      return res
        .status(401)
        .send("ไม่สามารถกำหนดเลขที่การเบิกได้ โปรดลองทำรายการอีกครั้ง");

    if (usedToolExist(msgs.success.tools)) {
      let tools = msgs.success.tools;

      await checkToolInDB(tools);
      await processRequestingTool(tools, cntTool);
    }

    if (toolNotEnough(msgs.error.tools)) {
      let tools = msgs.error.tools;
      actionType = "เบิกอุปกรณ์พร้อมบอร์ด (อุปกรณ์ยังไม่ครบ)";

      await checkToolInDB(tools);
      await processRequestingInsufficientTool(tools, cntTool);
      createNewInsufficientTool(board._id);
    }

    let newHistoryBoard = createNewHistoryBoard(cntBoard);

    if (hasInsufficientTool(insuffTool_id)) {
      newHistoryBoard.insuffTool = insuffTool_id;
      newInsuffiTool.hisb = newHistoryBoard._id;
      await newInsuffiTool.save();
    }

    cntBoard.cntNumber = cntBoard.cntNumber + 1;

    await createNotificationBoard(board);
    await cntBoard.save();
    await newHistoryBoard.save();
    await board.save();

    await sendDataToClient();
    res.status(200).json(msgs);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถเรียกข้อมูลรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  function usedToolNotExist(msgs) {
    return msgs.success.tools.length === 0 && msgs.error.tools.length === 0;
  }

  function usedToolExist(tools) {
    return tools.length !== 0;
  }

  async function checkToolInDB(tools) {
    for (let r = 0; r < tools.length; r++) {
      let tool = await Tool.findById(tools[r]._id);
      if (!tool)
        return res.status(401).send("รายการอุปกรณ์นี้ไม่มีอยู่ในฐานข้อมูล");
    }
  }

  async function processRequestingTool(tools, cntTool) {
    for (let r = 0; r < tools.length; r++) {
      let tool = await Tool.findById(tools[r]._id);
      tool.total = tools[r].toolInStock;
      let newHistoryTool = new HistoryTool({
        code: `${cntTool.name}${cntTool.cntNumber}`,
        tool: tools[r]._id,
        user: req.userId,
        total: tools[r].usedTool,
        actionType: "เบิกอุปกรณ์พร้อมบอร์ด",
        date: newDate,
        exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
        description: description,
        tags: [
          {
            user: req.userId,
            code: `${cntTool.name}${cntTool.cntNumber}-1`,
            action: "เบิกอุปกรณ์พร้อมบอร์ด",
            total: tools[r].usedTool,
            date: newDate,
            boardName: msgs.success.board.boardName,
            description: description,
          },
        ],
      });

      usedToolList.push({
        tid: tool._id,
        toolName: tool.toolName,
        total: tools[r].usedTool,
        hist: newHistoryTool._id,
      });

      cntTool.cntNumber = cntTool.cntNumber + 1;

      await createNotificationTool(tool);
      await cntTool.save();
      await newHistoryTool.save();
      await tool.save();
    }
  }

  async function processRequestingInsufficientTool(tools, cntTool) {
    for (let r = 0; r < tools.length; r++) {
      let tool = await Tool.findById(tools[r]._id);
      let newHistoryTool = new HistoryTool({
        code: `${cntTool.name}${cntTool.cntNumber}`,
        tool: tools[r]._id,
        user: req.userId,
        total: tool.total,
        actionType: "เบิกอุปกรณ์พร้อมบอร์ด",
        date: newDate,
        exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
        description: description,
        tags: [
          {
            user: req.userId,
            code: `${cntTool.name}${cntTool.cntNumber}-1`,
            action: "เบิกอุปกรณ์พร้อมบอร์ด (อุปกรณ์ยังไม่ครบ)",
            total: tool.total,
            date: newDate,
            boardName: msgs.success.board.boardName,
            description: description,
            insuffTotal: tools[r].insuffTotal,
          },
        ],
      });

      usedToolList.push({
        tid: tool._id,
        toolName: tool.toolName,
        total: tool.total,
        hist: newHistoryTool._id,
        insuffTotal: tools[r].insuffTotal,
      });

      incompleteToolList.push({
        tool: tool._id,
        total: tool.total,
        hist: newHistoryTool._id,
        insuffTotal: tools[r].insuffTotal,
      });

      tool.total = 0;
      cntTool.cntNumber = cntTool.cntNumber + 1;

      await createNotificationTool(tool);
      await cntTool.save();
      await newHistoryTool.save();
      await tool.save();
    }
  }

  function createNewInsufficientTool(boardId) {
    newInsuffiTool = new InsufficientTool({
      board: boardId,
      user: req.userId,
      tools: incompleteToolList,
    });

    insuffTool_id = newInsuffiTool._id;
  }

  function toolNotEnough(tools) {
    return tools.length !== 0;
  }

  function hasInsufficientTool(tool) {
    return tool !== null;
  }

  function createNewHistoryBoard(cntBoard) {
    return new HistoryBoard({
      code: `${cntBoard.name}${cntBoard.cntNumber}`,
      board: msgs.success.board._id,
      user: req.userId,
      total: msgs.success.board.usedBoard,
      actionType: "เบิกบอร์ดแบบชุด",
      date: newDate,
      exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
      description: description,
      tags: [
        {
          user: req.userId,
          code: `${cntBoard.name}${cntBoard.cntNumber}-1`,
          action: actionType,
          total: msgs.success.board.usedBoard,
          date: newDate,
          description: description,
          tools: usedToolList,
        },
      ],
    });
  }
};

const restoreBoard = async (req, res) => {
  const { hbid, bid, description } = req.body;

  try {
    let board = await Board.findById(bid);
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    let hisb = await HistoryBoard.findById(hbid);
    if (!hisb)
      return res
        .status(401)
        .send("ไม่พบข้อมูลประวัติรายการบอร์ดนี้ในฐานข้อมูล");

    await calculateBoardTotal(board, hisb);

    let newTag = {
      user: req.userId,
      code: `${hisb.code}-${hisb.tags.length + 1}`,
      action: "คืนสต๊อก",
      total: hisb.total,
      date: new Date(),
      description: description,
    };

    hisb.total = 0;
    await hisb.tags.unshift(newTag);

    await board.save();
    await hisb.save();

    let hisbs = await HistoryBoard.find()
      .populate("board")
      .populate("user")
      .populate("tags.user");

    // Sort from latest date to oldest date and Check expairation of data.
    let responseData = [];
    await covertHistoryBoardByCheckingDate(hisbs, responseData);

    let boards = await Board.find();
    io.emit("board-actions", boards);

    res.status(200).json(responseData);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถคืนรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function calculateBoardTotal(board, hisb) {
    if (hisb.actionType === "เพิ่ม") {
      if (board.total < hisb.total)
        return res
          .status(401)
          .send("จำนวนบอร์ดในสต๊อกมีน้อยกว่า ไม่สามารถหักลบค่าได้");
      board.total = board.total - hisb.total;
      await createNotificationBoard(board);
    } else {
      board.total = board.total + hisb.total;
      if (board.total > board.limit) {
        board.isAlert = false;
      }
    }
  }
};

// ยกเลิกการเบิกอุปกรณ์
const restoreBoardandTools = async (req, res) => {
  const { hbid, bid, description } = req.body;

  try {
    let board = await Board.findById(bid);
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    let hisb = await HistoryBoard.findById(hbid);
    if (!hisb)
      return res
        .status(401)
        .send("ไม่พบข้อมูลประวัติรายการบอร์ดนี้ในฐานข้อมูล");

    increaseBoard(board, hisb.total);

    let newTag = {
      user: req.userId,
      code: `${hisb.code}-${hisb.tags.length + 1}`,
      action: "คืนสต๊อก",
      total: hisb.total,
      date: new Date(),
      description: description,
      tools: hisb.tags[0].tools,
    };

    hisb.total = 0;

    await hisb.tags.unshift(newTag);
    await calculateLeftTool(hisb);

    if (hisb.insuffTool) {
      let insuffTool = await InsufficientTool.findById(hisb.insuffTool);
      if (insuffTool) {
        await insuffTool.remove();
      }
    }

    setBoardStatus(board);

    await hisb.save();
    await board.save();

    let hisbs = await HistoryBoard.find()
      .populate("board")
      .populate("user")
      .populate("tags.user");

    // Sort from latest date to oldest date and Check expairation of data.
    let responseData = [];
    await covertHistoryBoardByCheckingDate(hisbs, responseData);
    await sendDataToClient();

    res.status(200).json(responseData);
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถคืนรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function calculateLeftTool(hisb) {
    for (let r = 0; r < hisb.tags[0].tools.length; r++) {
      let data = hisb.tags[0].tools[r];
      let tool = await Tool.findById(data.tid);
      let hist = await HistoryTool.findById(data.hist);

      if (tool) {
        tool.total = tool.total + data.total;

        if (hist) {
          let newTag = {
            user: req.userId,
            code: `${hist.code}-${hist.tags.length + 1}`,
            action: "คืนสต๊อก",
            total: data.total,
            date: new Date(),
            description: description,
            boardName: hist.tags[0].boardName,
          };

          hist.total = 0;
          await hist.tags.unshift(newTag);
        }

        if (tool.total > tool.limit) {
          tool.isAlert = false;
        }

        await hist.save();
        await tool.save();
      }
    }
  }
};

const checkBoardEquipment = async (req, res) => {
  let total = Number(req.body.total);
  let boardId = req.params.bid;
  let errMsgList = { tools: [] };
  let successMsgList = { tools: [], board: null };

  try {
    if (total <= 0)
      return res.status(401).send("จำนวนที่ต้องการเบิกต้องมีค่าอย่างน้อย 1");

    let board = await Board.find({ _id: boardId }).populate("tools.tool");
    if (!board)
      return res.status(401).send("รายการบอร์ดนี้ไม่มีอยู่ในฐานข้อมูล");
    if (boardNotEnough(board[0].total, total)) {
      let calTotalBoard = decreaseBoard(board[0], total);
      return res.status(401).send(`ขาดบอร์ดจำนวน ${calTotalBoard} บอร์ด`);
    } else {
      successMsgList.board = {
        _id: board[0]._id,
        boardName: board[0].boardName,
        boardInStock: board[0].total - total,
        usedBoard: total,
      };
    }

    for (let r = 0; r < board[0].tools.length; r++) {
      let data = board[0].tools[r];
      let tool = await Tool.findById(data.tool._id);
      // จำนวนที่ผู้ใช้กรอกมา * จำนวนอุปกรณ์ที่ต้องใช้ต่อ 1 บอร์ด
      let allUsedTool = total * data.total;

      if (!tool)
        return res
          .status(401)
          .send(
            `รายการอุปกรณ์บางอย่างไม่อยู่ในฐานข้อมูล โปรดตรวจสอบข้อมูลอีกครั้ง`
          );

      if (toolIsNotEnough(tool.total, allUsedTool)) {
        let calInsuffTotal = allUsedTool - tool.total;
        // set data
        let arr = {
          _id: tool._id,
          toolName: tool.toolName,
          insuffTotal: calInsuffTotal,
          usedTool: allUsedTool,
        };
        errMsgList.tools.push(arr);
      } else {
        let calToolInStock = tool.total - allUsedTool;
        // set data
        let arr = {
          _id: tool._id,
          toolName: tool.toolName,
          toolInStock: calToolInStock,
          usedTool: allUsedTool,
        };
        successMsgList.tools.push(arr);
      }
    }

    res.status(200).json({ success: successMsgList, error: errMsgList });
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถตรวจสอบรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  function boardNotEnough(boardTotal, usedTotal) {
    return boardTotal < usedTotal;
  }
  function toolIsNotEnough(toolInStock, usedTool) {
    return usedTool > toolInStock;
  }
};

// การเบิกบอร์ด กรณีของไม่ครบ
const requestIncompleteTool = async (req, res) => {
  let { total, description, hisbId } = req.body;
  let totalInput = Number(total);
  let toolId = req.body.tool.tool._id;
  let insuffTotal = req.body.tool.insuffTotal;
  let histId = req.body.tool.hist;
  let usedTotal = req.body.tool.total;
  let newUsedTotal;
  let newInsuffTotal;
  let isToolOut = [];

  try {
    if (totalInput <= 0)
      return res.status(401).send("จำนวนตัวเลขต้องมีค่าอย่างน้อย 1");

    calculateLeftTool();

    let insuffiToolModel = await InsufficientTool.findById(req.params.incomid);
    let tool = await Tool.findById(toolId);

    if (!tool)
      return res
        .status(401)
        .send("ไม่ข้อมูลอุปกรณ์นี้ในฐานข้อมูล โปรดตรวจสอบข้อมูลอีกครั้ง");

    let hisb = await HistoryBoard.findById(hisbId);
    let hist = await HistoryTool.findById(histId);

    if (tool.total < totalInput)
      return res
        .status(401)
        .send("จำนวนอุปกรณ์ในสต๊อกมีไม่เพียงพอ โปรดตรวจสอบข้อมูลอีกครั้ง");

    tool.total = tool.total - totalInput;
    hist.total = newUsedTotal;

    await editToolHistory(hist);
    await editBoardHistory(hisb, insuffiToolModel, tool);

    await createNotificationTool(tool);
    await tool.save();

    let stt = await Stt.find();
    await updateToolData(stt);

    let lists = await InsufficientTool.find()
      .populate("board")
      .populate("user")
      .populate("hisb")
      .populate("tools.tool");
    let newData = await orderData(lists);

    if (newData.length !== 0) {
      await covertTypeandCateTool4(newData, stt);
    }
    res.status(200).json(newData);
  } catch (error) {
    catchError(res, "เซิร์ฟเวอร์ขัดข้อง ไม่สามารถทำรายการได้", 500, error);
  }

  async function editToolHistory(hist) {
    if (hist) {
      let actionTypeTool = "เบิกอุปกรณ์พร้อมบอร์ด (อุปกรณ์ยังไม่ครบ)";
      if (newInsuffTotal === 0) {
        actionTypeTool = "เบิกอุปกรณ์พร้อมบอร์ด";
      }

      let newTag = {
        user: req.userId,
        code: `${hist.code}-${hist.tags.length + 1}`,
        action: actionTypeTool,
        total: newUsedTotal,
        date: new Date(),
        boardName: hist.tags[0].boardName,
        description: description,
        insuffTotal: newInsuffTotal,
      };

      await hist.tags.unshift(newTag);
      await hist.save();
    }
  }
  async function editBoardHistory(hisb, insuffiToolModel, tool) {
    if (hisb) {
      let actionType = "เบิกอุปกรณ์พร้อมบอร์ด (อุปกรณ์ยังไม่ครบ)";
      let newToolsArr = [];
      let currentTag = hisb.tags[0];
      for (let r = 0; r < currentTag.tools.length; r++) {
        if (currentTag.tools[r].tid.toString() === toolId) {
          newToolsArr.push({
            tid: tool._id,
            toolName: tool.toolName,
            hist: histId,
            total: newUsedTotal,
            insuffTotal: newInsuffTotal,
          });
          if (newInsuffTotal !== 0) {
            isToolOut.push(currentTag.tools[r].tid);
          }
        } else {
          newToolsArr.push(currentTag.tools[r]);
          if (
            currentTag.tools[r].insuffTotal &&
            currentTag.tools[r].insuffTotal !== 0
          ) {
            isToolOut.push(currentTag.tools[r].tid);
          }
        }
      }

      // If there is no insufficient tool. Delete incomplete-tool document
      if (insuffiToolModel) {
        if (isToolOut.length === 0) {
          actionType = "เบิกอุปกรณ์พร้อมบอร์ด";
          await insuffiToolModel.remove();
        } else {
          for (let r = 0; r < insuffiToolModel.tools.length; r++) {
            if (insuffiToolModel.tools[r].tool.toString() === toolId) {
              insuffiToolModel.tools[r].total = newUsedTotal;
              insuffiToolModel.tools[r].insuffTotal = newInsuffTotal;
            }
            await insuffiToolModel.save();
          }
        }
      }

      let newTag = {
        user: req.userId,
        code: `${hisb.code}-${hisb.tags.length + 1}`,
        total: hisb.total,
        date: new Date(),
        description: description,
        tools: newToolsArr,
      };

      newTag.action = actionType;
      await hisb.tags.unshift(newTag);
      await hisb.save();
    }
  }
  function calculateLeftTool() {
    if (totalInput >= insuffTotal) {
      totalInput = insuffTotal;
      newInsuffTotal = 0;
      newUsedTotal = totalInput + usedTotal;
    } else {
      newInsuffTotal = insuffTotal - totalInput;
      newUsedTotal = usedTotal + totalInput;
    }
  }
  async function updateToolData(stt) {
    let tools = await Tool.find();
    await covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);
  }
};

// การลบรายการบอร์ด
const deleteBoard = async (req, res) => {
  let boardId = req.params.bid;

  try {
    let board = await Board.findById(boardId);

    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    let avartar = board.avartar.public_id;

    await handleImages(board, avartar);
    await board.remove();

    res.status(200).send("delete success");
  } catch (error) {
    catchError(
      res,
      "ไม่สามารถลบรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง",
      500,
      error
    );
  }

  async function handleImages(board, avartar) {
    // ลบรูปภาพของอุปกรณ์
    if (imageExist(board.images)) {
      for (var i = 0; i < board.images.length; i++) {
        await deleteImageInCloudinary(board.images[i].public_id);
      }
    }

    // ลบรูปภาพโปรไฟล์ของอุปกรณ์
    if (avartar) {
      await deleteImageInCloudinary(avartar);
    }
  }

  function imageExist(image) {
    return image.length !== 0;
  }
};

exports.getAllBoards = getAllBoards;
exports.getAllHistoryBoards = getAllHistoryBoards;
exports.getBoard = getBoard;
exports.getIncompleteTool = getIncompleteTool;
exports.editBoard = editBoard;
exports.actionBoard = actionBoard;
exports.requestBoard = requestBoard;
exports.checkBoardEquipment = checkBoardEquipment;
exports.requestIncompleteTool = requestIncompleteTool;
exports.createBoard = createBoard;
exports.restoreBoard = restoreBoard;
exports.restoreBoardandTools = restoreBoardandTools;
// exports.updateIncompleteBoard = updateIncompleteBoard;
exports.deleteBoard = deleteBoard;
