const Tool = require("../models/tool");
const Stt = require("../models/setting-tool-type");
const cloudinary = require("../utils/cloudinary");
const io = require("../index.js");
const {
  orderData,
  covertTypeandCateTool,
  covertTypeandCateTool2,
  covertTypeandCateTool3,
  covertHistoryBoardByCheckingDate,
} = require("../utils/covertData");

const HistoryTool = require("../models/history-tool");
const HistoryBoard = require("../models/history-board");
const HistoryCnt = require("../models/history-cnt");
const Board = require("../models/board");
const InsufficientTool = require("../models/incomplete-tool");
const {
  createNotificationTool,
  createNotificationBoard,
} = require("../utilsServer/notificationActions");

// รับข้อมูลบอร์ดทั้งหมด
const getAllBoards = async (req, res) => {
  // console.log(io)
  try {
    let boardLists = await Board.find().populate("tools.tool");
    res.status(200).json(boardLists);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถเรียกข้อมูลรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// รับข้อมูลบอร์ดที่ผู้ใช้เลือก
const getBoard = async (req, res) => {
  try {
    let board = await Board.findById(req.params.bid);
    // let board = await boardLists.find()
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    // Are those data available ?. if not, delete immaditly it.
    // console.log(board[0].tools.length)
    let newToolArr = [];
    for (let r = 0; r < board.tools.length; r++) {
      let tool = await Tool.findById(board.tools[r].tool);
      if (tool) {
        newToolArr.push(board.tools[r]);
      }
    }
    if (newToolArr.length !== board.tools.length) {
      board.tools = newToolArr;
      await board.save();
    }

    let stt = await Stt.find();
    let data = await Board.find({ _id: req.params.bid }).populate("tools.tool");
    await covertTypeandCateTool2(data[0].tools, stt);
    res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถเรียกข้อมูลรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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
    covertHistoryBoardByCheckingDate(hisbs, responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "ไม่สามารถเรียกข้อมูลประวัติรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง"
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
      if(list.board !== null) {
        for (let r2 = 0; r2 < list.tools.length; r2++) {
          if (list.tools[r2].tool.toolName) {
            newToolArr.push(list.tools[r2]);
          }
        }
        list.tools = newToolArr;
        if (list.tools.length === 0) {
          // console.log("removing...")
          await list.remove();
        } else {
          // console.log("saving...")
          await list.save();
        }
      } else {
        // console.log("removing1...")
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
    for (let r = 0; r < lists.length; r++) {
      await covertTypeandCateTool2(newData[0].tools, stt);
    }
    res.status(200).json(newData);
  } catch (error) {
    console.error(error);
    res.status(500).send("ไม่สามารถเรียกข้อมูลได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// สร้างรายการบอร์ด
const createBoard = async (req, res) => {
  const { boardName, boardCode, type, tools, description } = req.body;
  try {
    let convTools = JSON.parse(tools);
    let newToolsArr = [];
    for (let r = 0; r < convTools.length; r++) {
      let findTool = await Tool.findById(convTools[r]._id);
      if (findTool) {
        newToolsArr = [
          ...newToolsArr,
          { tool: convTools[r]._id, total: Number(convTools[r].total) },
        ];
      }
    }

    let newBoard = new Board({
      boardName: boardName,
      boardCode: boardCode,
      type: type,
      tools: newToolsArr,
      total: 0,
      limit: 0,
      description: description,
    });

    if (req.file !== undefined) {
      await cloudinary.uploader.upload(req.file.path, (error, result) => {
        if (error)
          res.status(401).send("ไม่สามารถอัพโหลดรูปภาพไปยังบนคลาวค์ได้");
        else {
          newBoard.avartar = {
            url: result.secure_url,
            public_id: result.public_id,
          };
        }
      });
    }

    await newBoard.save();

    console.log(newBoard);
    res.status(201).json(newBoard);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถสร้างรายการบอร์ดใหม่ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// การเบิก/เพิ่มบอร์ด
const actionBoard = async (req, res) => {
  // Tool: 614c2b3d246f3c25995dc745
  // Board: 614c2b490e1240c5f3e5a6c5
  const { total, description, actionType } = req.body;
  const boardId = req.params.bid;
  const boardTotal = Number(total);
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
    if (actionType === "เพิ่ม") {
      board.total = board.total + boardTotal;
      if (board.total > board.limit) {
        board.isAlert = false;
      }
    } else {
      if (board.total < boardTotal)
        return res.status(401).send("จำนวนบอร์ดที่เบิกมีมากกว่าในสต๊อก");
      board.total = board.total - boardTotal;
      await createNotificationBoard(board);
    }

    let newHistoryBoard = new HistoryBoard({
      code: `${cntBoard.name}${cntBoard.cntNumber}`,
      board: boardId,
      user: req.userId,
      total: boardTotal,
      actionType: actionType,
      date: new Date(),
      exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
      description: description,
      tags: [
        {
          user: req.userId,
          code: `${cntBoard.name}${cntBoard.cntNumber}-1`,
          action: actionType,
          total: boardTotal,
          date: new Date(),
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
    console.log(error);
    res.status(500).send("ไม่สามารถทำรายการได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// แก้ไขข้อมูลบอร์ด
const editBoard = async (req, res) => {
  const {
    boardName,
    boardCode,
    type,
    images,
    avartar,
    description,
    oldImages,
    delImages,
    limit,
    tools,
  } = req.body;
  // ตัวแปรรูปภาพที่จะถูกลบ
  let delImgArr = [];

  if (Number(limit) <= 0)
    return res.status(401).send("จำนวนตัวเลขการแจ้งเตือนต้องมีค่าอย่างน้อย 1");

  try {
    let board = await Board.findById(req.params.bid);
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    let convTools = JSON.parse(tools);
    let newToolsArr = [];
    for (let r = 0; r < convTools.length; r++) {
      let findTool = await Tool.findById(convTools[r]._id);
      if (findTool) {
        newToolsArr = [
          ...newToolsArr,
          { tool: convTools[r]._id, total: Number(convTools[r].total) },
        ];
      }
    }

    board.boardName = boardName;
    board.boardCode = boardCode;
    board.type = type;
    board.limit = limit;
    board.description = description;
    board.tools = newToolsArr;

    // อัพโหลดโปรไฟล์อุปกรณ์
    // ถ้ารูปอุปกรณ์ถูกลบหรือไม่ได้กำหนดมา
    if (avartar === "false") {
      // ลบรูปภาพเดิมออกแล้วเพิ่มรูปภาพระบบไปแทน
      if (board.avartar.public_id) {
        delImgArr = [...delImgArr, board.avartar.public_id];
        board.avartar = {};
        // console.log("set default image and delete");
      }
    }
    // ผู้ใช้งานกำหนดรูปภาพใหม่
    else if (avartar === "true") {
      // ถ้ามีรูปเก่าในระบบให้ลบ และเพิ่มรุปภาพใหม่เข้าไป
      if (board.avartar.public_id) {
        delImgArr = [...delImgArr, board.avartar.public_id];
        await cloudinary.uploader.upload(req.files[0].path, (error, result) => {
          if (error) console.log("can not upload image on clound");
          board.avartar = {
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
          board.avartar = {
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
      board.images = newImgArr;
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
      board.images = newImgArr;
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
    await board.save();
    res.status(200).json(board);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถแก้ไขรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
  }
};

// การเบิกบอร์ด
const requestBoard = async (req, res) => {
  const { msgs, description } = req.body;
  // console.log(msgs.success.tools[0].toolName)
  try {
    let usedToolList = [];
    let incompleteToolList = [];
    let board = await Board.findById(msgs.success.board._id);
    let actionType = "เบิกอุปกรณ์พร้อมบอร์ด";
    let insuffTool_id = null;
    let newInsuffiTool = null;
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");
    board.total = msgs.success.board.boardInStock;

    let cntBoard = await HistoryCnt.findById("614c2b490e1240c5f3e5a6c5");
    let cntTool = await HistoryCnt.findById("614c2b3d246f3c25995dc745");
    if (!cntBoard || !cntTool)
      return res
        .status(401)
        .send("ไม่สามารถกำหนดเลขที่การเบิกได้ โปรดลองทำรายการอีกครั้ง");

    if (msgs.success.tools.length !== 0) {
      let tools = msgs.success.tools;

      for (let r = 0; r < tools.length; r++) {
        let tool = await Tool.findById(tools[r]._id);
        if (!tool)
          return res.status(401).send("รายการอุปกรณ์นี้ไม่มีอยู่ในฐานข้อมูล");
      }

      for (let r = 0; r < tools.length; r++) {
        let tool = await Tool.findById(tools[r]._id);
        tool.total = tools[r].toolInStock;
        let newHistoryTool = new HistoryTool({
          code: `${cntTool.name}${cntTool.cntNumber}`,
          tool: tools[r]._id,
          user: req.userId,
          total: tools[r].usedTool,
          actionType: "เบิกอุปกรณ์พร้อมบอร์ด",
          date: new Date(),
          exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
          description: description,
          tags: [
            {
              user: req.userId,
              code: `${cntTool.name}${cntTool.cntNumber}-1`,
              action: "เบิกอุปกรณ์พร้อมบอร์ด",
              total: tools[r].usedTool,
              date: new Date(),
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

        // console.log("------Tool------");
        // console.log(tool);
        // console.log("------HistoryTool------");
        // console.log(newHistoryTool);
        await createNotificationTool(tool);
        await cntTool.save();
        await newHistoryTool.save();
        await tool.save();
      }
    }

    if (msgs.error.tools.length !== 0) {
      let tools = msgs.error.tools;
      actionType = "เบิกอุปกรณ์พร้อมบอร์ด (อุปกรณ์ยังไม่ครบ)";

      for (let r = 0; r < tools.length; r++) {
        let tool = await Tool.findById(tools[r]._id);
        if (!tool)
          return res.status(401).send("รายการอุปกรณ์นี้ไม่มีอยู่ในฐานข้อมูล");
      }

      for (let r = 0; r < tools.length; r++) {
        let tool = await Tool.findById(tools[r]._id);
        let newHistoryTool = new HistoryTool({
          code: `${cntTool.name}${cntTool.cntNumber}`,
          tool: tools[r]._id,
          user: req.userId,
          total: tool.total,
          actionType: "เบิกอุปกรณ์พร้อมบอร์ด",
          date: new Date(),
          exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
          description: description,
          tags: [
            {
              user: req.userId,
              code: `${cntTool.name}${cntTool.cntNumber}-1`,
              action: "เบิกอุปกรณ์พร้อมบอร์ด (อุปกรณ์ยังไม่ครบ)",
              total: tool.total,
              date: new Date(),
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

        // console.log("------Tool-In------");
        // console.log(tool);
        // console.log("------HistoryTool------");
        // console.log(newHistoryTool);
        await createNotificationTool(tool);
        await cntTool.save();
        await newHistoryTool.save();
        await tool.save();
      }
      newInsuffiTool = new InsufficientTool({
        board: board._id,
        user: req.userId,
        tools: incompleteToolList,
      });

      insuffTool_id = newInsuffiTool._id;
    }

    let newHistoryBoard = new HistoryBoard({
      code: `${cntBoard.name}${cntBoard.cntNumber}`,
      board: msgs.success.board._id,
      user: req.userId,
      total: msgs.success.board.usedBoard,
      actionType: "เบิกบอร์ดแบบชุด",
      date: new Date(),
      exp: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
      description: description,
      tags: [
        {
          user: req.userId,
          code: `${cntBoard.name}${cntBoard.cntNumber}-1`,
          action: actionType,
          total: msgs.success.board.usedBoard,
          date: new Date(),
          description: description,
          tools: usedToolList,
        },
      ],
    });

    if (insuffTool_id !== null) {
      newHistoryBoard.insuffTool = insuffTool_id;
      newInsuffiTool.hisb = newHistoryBoard._id;
      await newInsuffiTool.save();
    }

    cntBoard.cntNumber = cntBoard.cntNumber + 1;

    // console.log("------Board------");
    // console.log(board);
    // console.log("------HistoryBoard------");
    // console.log(newHistoryBoard);
    // console.log("------InsuffTool------");
    // console.log(newInsuffiTool);
    await createNotificationBoard(board);
    await cntBoard.save();
    await newHistoryBoard.save();
    await board.save();

    let boards = await Board.find();
    io.emit("board-actions", boards);
    let tools = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);

    res.status(200).json(msgs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถเรียกข้อมูลรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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
    covertHistoryBoardByCheckingDate(hisbs, responseData);

    let boards = await Board.find();
    io.emit("board-actions", boards);

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถคืนรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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

    board.total = board.total + hisb.total;

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

        // console.log("-----Tool-----");
        // console.log(tool);
        // console.log("-----HistoryTool-----");
        // console.log(hist);
        if (tool.total > tool.limit) {
          tool.isAlert = false;
        }
        await hist.save();
        await tool.save();
      }
    }

    // console.log("-----Board-----");
    // console.log(board);
    // console.log("-----HistoryBoard-----");
    // console.log(hisb);

    if (hisb.insuffTool) {
      let insuffTool = await InsufficientTool.findById(hisb.insuffTool);
      if (insuffTool) {
        await insuffTool.remove();
      }
    }

    if (board.total > board.limit) {
      board.isAlert = false;
    }
    await hisb.save();
    await board.save();

    let hisbs = await HistoryBoard.find()
      .populate("board")
      .populate("user")
      .populate("tags.user");

    // Sort from latest date to oldest date and Check expairation of data.
    let responseData = [];
    covertHistoryBoardByCheckingDate(hisbs, responseData);

    let boards = await Board.find();
    io.emit("board-actions", boards);
    let tools = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);

    res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถคืนรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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
    if (board[0].total < total) {
      let calTotalBoard = board[0].total - total;
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
      if (allUsedTool > tool.total) {
        let calInsuffTotal = allUsedTool - tool.total;
        let arr = {
          _id: tool._id,
          toolName: tool.toolName,
          insuffTotal: calInsuffTotal,
          usedTool: allUsedTool,
        };
        errMsgList.tools.push(arr);
      } else {
        let calToolInStock = tool.total - allUsedTool;
        let arr = {
          _id: tool._id,
          toolName: tool.toolName,
          toolInStock: calToolInStock,
          usedTool: allUsedTool,
        };
        // console.log()
        successMsgList.tools.push(arr);
      }
    }

    res.status(200).json({ success: successMsgList, error: errMsgList });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send("ไม่สามารถตรวจสอบรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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
  let arr = [{ tool: {}, hist: {}, hisb: {}, incom: {} }];
  try {
    if (totalInput <= 0)
      return res.status(401).send("จำนวนตัวเลขต้องมีค่าอย่างน้อย 1");
    if (totalInput >= insuffTotal) {
      totalInput = insuffTotal;
      newInsuffTotal = 0;
      newUsedTotal = totalInput + usedTotal;
    } else {
      newInsuffTotal = insuffTotal - totalInput;
      newUsedTotal = usedTotal + totalInput;
    }
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
    // Edit tool-history
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
      // arr[0].hist = hist;
    }
    // Edit board-history
    if (hisb) {
      let actionType = "เบิกอุปกรณ์พร้อมบอร์ด (อุปกรณ์ยังไม่ครบ)";
      let newToolsArr = [];
      for (let r = 0; r < hisb.tags[0].tools.length; r++) {
        if (hisb.tags[0].tools[r].tid.toString() === toolId) {
          newToolsArr.push({
            tid: tool._id,
            toolName: tool.toolName,
            hist: histId,
            total: newUsedTotal,
            insuffTotal: newInsuffTotal,
          });
          if (newInsuffTotal !== 0) {
            isToolOut.push(hisb.tags[0].tools[r].tid);
          }
        } else {
          newToolsArr.push(hisb.tags[0].tools[r]);
          if (
            hisb.tags[0].tools[r].insuffTotal &&
            hisb.tags[0].tools[r].insuffTotal !== 0
          ) {
            isToolOut.push(hisb.tags[0].tools[r].tid);
          }
        }
      }
      // If there is no insufficient tool. Delete incomplete-tool document
      if (insuffiToolModel) {
        if (isToolOut.length === 0) {
          console.log("delete");
          actionType = "เบิกอุปกรณ์พร้อมบอร์ด";
          await insuffiToolModel.remove();
        } else {
          for (let r = 0; r < insuffiToolModel.tools.length; r++) {
            if (insuffiToolModel.tools[r].tool.toString() === toolId) {
              insuffiToolModel.tools[r].total = newUsedTotal;
              insuffiToolModel.tools[r].insuffTotal = newInsuffTotal;
            }
            // arr[0].incom = insuffiToolModel;
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
      // arr[0].hisb = hisb;
    }

    // arr[0].tool = tool;
    await createNotificationTool(tool);
    await tool.save();
    let tools = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);

    let lists = await InsufficientTool.find()
      .populate("board")
      .populate("user")
      .populate("hisb")
      .populate("tools.tool");
    let newData = await orderData(lists);
    res.status(200).json(newData);
  } catch (error) {
    console.log(error);
    res.status(500).send("เซิร์ฟเวอร์ขัดข้อง ไม่สามารถทำรายการได้");
  }

  // res.status(200).json([{id: "5555"}])
};

// การลบรายการบอร์ด
const deleteBoard = async (req, res) => {
  let boardId = req.params.bid;

  // หาข้อมูลอุปกรณ์
  try {
    let board = await Board.findById(boardId);
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");

    // ลบรูปภาพของอุปกรณ์
    if (board.images.length !== 0) {
      for (var i = 0; i < board.images.length; i++) {
        await cloudinary.uploader.destroy(
          board.images[i].public_id,
          (error, res) => {
            if (error) console.log("can not delete image");
            else console.log("delete images");
          }
        );
      }
    }

    // ลบรูปภาพโปรไฟล์ของอุปกรณ์
    if (board.avartar.public_id) {
      await cloudinary.uploader.destroy(
        board.avartar.public_id,
        (error, res) => {
          if (error) console.log("can not delete image");
          else console.log("delete image");
        }
      );
    }

    await board.remove();

    // let boards = await board.find();
    // let stt = await Stt.find();
    // covertTypeandCateboard(boards, stt);
    // io.emit("board-actions", tools);

    res.status(200).send("delete success");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("ไม่สามารถแก้ไขรายการอุปกรณ์ได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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
