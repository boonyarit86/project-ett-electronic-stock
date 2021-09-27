const Tool = require("../models/tool");
const Stt = require("../models/setting-tool-type");
const cloudinary = require("../utils/cloudinary");
const io = require("../index.js");
const { orderData } = require("../utils/covertData");

const HistoryTool = require("../models/history-tool");
const HistoryBoard = require("../models/history-board");
const HistoryCnt = require("../models/history-cnt");
const Board = require("../models/board");

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
    let board = await Board.find({ _id: req.params.bid }).populate(
      "tools.tool"
    );
    // let board = await boardLists.find()
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");
    res.status(200).json(board[0]);
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
    let newData = await orderData(hisbs);
    res.status(200).json(newData);
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
const getIncompleteBoard = async (req, res, next) => {
  // let incompleteTool;
  // try {
  //     incompleteTool = await IncompleteTool.find();
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not fetching data about Incomplete Board.',
  //         500
  //     );
  //     return next(error);
  // }
  // res.json(incompleteTool);
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
    } else {
      if (board.total < boardTotal)
        return res.status(401).send("จำนวนบอร์ดที่เบิกมีมากกว่าในสต๊อก");
      board.total = board.total - boardTotal;
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
    return res.status(401).send("จำนวนต้องมีค่าอย่างน้อย 1");

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
    let board = await Board.findById(msgs.success.board._id);
    if (!board)
      return res.status(401).send("ไม่พบข้อมูลรายการบอร์ดในฐานข้อมูล");
    board.total = msgs.success.board.boardInStock;

    let cntBoard = await HistoryCnt.findById("614c2b490e1240c5f3e5a6c5");
    let cntTool = await HistoryCnt.findById("614c2b3d246f3c25995dc745");
    if (!cntBoard || !cntTool)
      return res
        .status(401)
        .send("ไม่สามารถกำหนดเลขที่การเบิกได้ โปรดลองทำรายการอีกครั้ง");

    if (msgs.error.tools.length === 0) {
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
          tool: tools[r]._id,
          total: tools[r].usedTool,
          hist: newHistoryTool._id,
        });
        cntTool.cntNumber = cntTool.cntNumber + 1;

        // console.log("------Tool------");
        // console.log(tool);
        // console.log("------HistoryTool------");
        // console.log(newHistoryTool);
        await cntTool.save();
        await newHistoryTool.save();
        await tool.save();
      }
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
          action: "เบิกบอร์ดแบบชุด",
          total: msgs.success.board.usedBoard,
          date: new Date(),
          description: description,
          tools: usedToolList,
        },
      ],
    });

    cntBoard.cntNumber = cntBoard.cntNumber + 1;

    // console.log("------Board------");
    // console.log(board);
    // console.log("------HistoryBoard------");
    // console.log(newHistoryBoard);
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
        return res.status(401).send("จำนวนบอร์ดในสต๊อกมีน้อยกว่า ไม่สามารถหักลบค่าได้");
      board.total = board.total - hisb.total;
    } else {
      board.total = board.total + hisb.total;
    }

    let newTag = {
      user: req.userId,
      code: `${hisb.code}-${hisb.tags.length + 1}`,
      action: "คืนสต๊อก",
      total: hisb.total,
      date: new Date(),
      description: description
    }
    hisb.total = 0;
    await hisb.tags.unshift(newTag)

    await board.save();
    await hisb.save();

    let hisbs = await HistoryBoard.find()
    .populate("board")
    .populate("user")
    .populate("tags.user");
    let newData =  await orderData(hisbs);

    let boards = await Board.find();
    io.emit("board-actions", boards);


    res.status(200).json(newData);
  } catch (error) {
    console.error(error);
    res.status(500).send("ไม่สามารถคืนรายการบอร์ดได้ เนื่องจากเซิร์ฟเวอร์ขัดข้อง");
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

    board.total = board.total + hisb.total

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
      let tool = await Tool.findById(data.tool);
      let hist = await HistoryTool.findById(data.hist);
      if (tool) {
        tool.total = tool.total + data.total;
      }
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
      await hist.save();
      await tool.save();
    }

    // console.log("-----Board-----");
    // console.log(board);
    // console.log("-----HistoryBoard-----");
    // console.log(hisb);

    await hisb.save();
    await board.save();

    let hisbs = await HistoryBoard.find()
      .populate("board")
      .populate("user")
      .populate("tags.user");
    let newData = await orderData(hisbs);

    let boards = await Board.find();
    io.emit("board-actions", boards);
    let tools = await Tool.find();
    let stt = await Stt.find();
    covertTypeandCateTool(tools, stt);
    io.emit("tool-actions", tools);

    res.status(200).json(newData);
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
        let calInsuffTool = allUsedTool - tool.total;
        let arr = {
          _id: tool._id,
          toolName: tool.toolName,
          instuffTool: calInsuffTool,
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
const requestBoardandIncompleteTool = async (req, res, next) => {
  // const { username, status, description, image } = req.body;
  // let total = Number(req.body.total);
  // let board;
  // let toolList = []
  // let toolIncomplete = []
  // let newToolsId = []
  // // หาข้อมูลบอร์ดที่ต้องการแก้
  // try {
  //     board = await Board.findById(req.params.bid);
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not find board by id.',
  //         500
  //     );
  //     return next(error);
  // }
  // // คำนวณอุปกรณ์ที่ใช้แล้วทำการแก้ไข
  // for (var round = 0; round < board.tools.length; round++) {
  //     let tool;
  //     let toolId = board.tools[round].id;
  //     let calTool;
  //     let cntTool
  //     // หาอุปกรณ์ที่ต้องการแก้
  //     try {
  //         tool = await Tool.findById(toolId);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find tool by id in process forLoop.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // ข้อมูลเลขที่การเบิกอุปกรณ์
  //     try {
  //         cntTool = await HistoryCnt.findById("608386350b3e6333741b6c01");
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find cntNumber.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // ผลลัพธ์จำนวนอุปกรณ์ที่ใช้
  //     calTool = Number(board.tools[round].total) * total
  //     // เก็บค่าว่าใช้อุปกรณ์อะไรบ้างในการเบิกบอร์ด
  //     toolList = [...toolList,
  //     {
  //         id: tool._id,
  //         toolName: tool.toolName,
  //         toolCode: tool.toolCode,
  //         type: tool.type,
  //         category: tool.category,
  //         size: tool.size,
  //         total: calTool
  //     }
  //     ]
  //     // ค่าติดลบที่ได้ จะเอาไปเก็บในอุปกรณ์คงค้าง 150 -200 = -50
  //     let calSumTotal = tool.total - calTool
  //     let sumTotal;
  //     let newActionType;
  //     if (calSumTotal < 0) {
  //         sumTotal = tool.total
  //         tool.total = 0
  //         newActionType = "requestIncomplete"
  //     } else {
  //         sumTotal = calTool
  //         tool.total = tool.total - calTool
  //         newActionType = "requestFromBoard"
  //     }
  //     let createActionEdit = [
  //         {
  //             code: cntTool.name + (cntTool.cntNumber + 1) + "-1",
  //             username: username,
  //             total: sumTotal,
  //             status: status,
  //             date: new Date().toString(),
  //             description: description,
  //             actionType: newActionType
  //         }
  //     ]
  //     // บันทึกข้อมูลประวัติการเบิกของครั้งแรกโดยไม่ได้เก็บข้อมูลไอดีของอุปกรณ์ไม่ครบ
  //     let newHistory = new HistoryTool({
  //         code: cntTool.name + (cntTool.cntNumber + 1),
  //         tid: tool._id,
  //         toolName: tool.toolName,
  //         boardName: board.boardName,
  //         boardCode: board.boardCode,
  //         boardType: board.type,
  //         type: tool.type,
  //         category: tool.category,
  //         size: tool.size,
  //         date: new Date(),
  //         total: sumTotal,
  //         username: username,
  //         status: status,
  //         actionType: newActionType,
  //         exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
  //         description: description,
  //         actionEdit: createActionEdit
  //     })
  //     try {
  //         await tool.save()
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a tool in process forLoop.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // บันทึกข้อมูลเลขที่การเบิก
  //     cntTool.cntNumber = cntTool.cntNumber + 1
  //     try {
  //         await cntTool.save();
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save cntHistory.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     try {
  //         await newHistory.save()
  //         newToolsId = [...newToolsId, newHistory._id]
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a history-tool in process forLoop.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // เก็บข้อมูลว่า ในการเบิกบอร์ดครั้งนี้ขาดอุปกรณ์อะไรบ้าง
  //     if (calSumTotal < 0) {
  //         let temArr = {
  //             tid: tool._id,
  //             htid: newHistory._id,
  //             toolName: tool.toolName,
  //             total: calSumTotal,
  //             type: tool.type,
  //             category: tool.category,
  //             size: tool.size
  //         }
  //         toolIncomplete = [...toolIncomplete, temArr]
  //     }
  // }
  // // บันทึกข้อมูลไปยัง ตารางอุปกรณ์ไม่ครบ
  // let createIncompleteTool = new IncompleteTool({
  //     bid: board._id,
  //     username: username,
  //     status: status,
  //     imageProfile: image,
  //     boardName: board.boardName,
  //     boardCode: board.boardCode,
  //     date: new Date().toString(),
  //     tools: toolIncomplete,
  //     actionType: "requestFromBoard"
  // })
  // try {
  //     await createIncompleteTool.save()
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not save a incompleTool.',
  //         500
  //     );
  //     return next(error);
  // }
  // ทำการเอาไอดีของตารางอุปกรณ์ไม่ครบ ไปเพิ่มในข้อมูลประวัติการเบิกอุปกรณ์ สำหรับ อุปกรณ์ที่มีไม่พอ
  // for (var round = 0; round < createIncompleteTool.tools.length; round++) {
  //     let incomId = createIncompleteTool.tools[round].htid
  //     let findhisTool;
  //     try {
  //         findhisTool = await HistoryTool.findById(incomId)
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a incompleTool.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     findhisTool.incompleteToolid = createIncompleteTool._id
  //     try {
  //         await findhisTool.save()
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a id incomplete in db of history-tool.',
  //             500
  //         );
  //         return next(error);
  //     }
  // }
  // let cntBoard;
  // // ข้อมูลเลขที่การเบิกบอร์ด
  // try {
  //     cntBoard = await HistoryCnt.findById("608386543e4e3458083fb2c0");
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not find cntNumber.',
  //         500
  //     );
  //     return next(error);
  // }
  // let createActionEditBoard = [
  //     {
  //         code: cntBoard.name + (cntBoard.cntNumber + 1) + "-1",
  //         username: username,
  //         total: total,
  //         status: status,
  //         date: new Date().toString(),
  //         description: description,
  //         actionType: "request"
  //     }
  // ]
  // // บันทึกข้อมูลประวัติการเบิกของและเก็บข้อมูลไอดีของตารางอุปกรณ์ไม่ครบ
  // let newHistoryBoard = new HistoryBoard({
  //     code: cntBoard.name + (cntBoard.cntNumber + 1),
  //     bid: board._id,
  //     tid: newToolsId,
  //     incompleteToolid: createIncompleteTool._id,
  //     boardName: board.boardName,
  //     boardCode: board.boardCode,
  //     date: new Date(),
  //     total: total,
  //     username: username,
  //     status: status,
  //     actionType: "requestFromBoard",
  //     exp: new Date(new Date().getTime() + (1000 * 60) * (1440 * 180)),
  //     description: description,
  //     actionEdit: createActionEditBoard,
  //     tools: toolList
  // })
  // board.total = board.total - total
  // try {
  //     await newHistoryBoard.save()
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not save a history-board.',
  //         500
  //     );
  //     return next(error);
  // }
  // try {
  //     await board.save()
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not save a board.',
  //         500
  //     );
  //     return next(error);
  // }
  // // บันทึกข้อมูลเลขที่การเบิก
  // cntBoard.cntNumber = cntBoard.cntNumber + 1
  // try {
  //     await cntBoard.save();
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not save cntHistory.',
  //         500
  //     );
  //     return next(error);
  // }
  // res.status(201).json(board)
  // console.log("request board and Incomplete successfully")
  // console.log(newHistoryBoard)
};

// การยกเลิกการเบิกบอร์ด
const cancelRequestBoard = async (req, res, next) => {
  // const { username, description, status } = req.body;
  // // หาข้อมูลประวัติการเบิกบอร์ด
  // let histboard;
  // try {
  //     histboard = await HistoryBoard.findById(req.params.htbid);
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not find a histboard.',
  //         500
  //     );
  //     return next(error);
  // }
  // // เริ่มค้นหาข้อมูล ประวัติการเบิกอุปกรณ์
  // for (var round = 0; round < histboard.tid.length; round++) {
  //     let histool;
  //     let tool;
  //     try {
  //         histool = await HistoryTool.findById(histboard.tid[round]);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find a histool in forLoop.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     if (histool.isDeleted === false) {
  //         // เริ่มขั้นตอนการคืนอุปกรณ์ไปยังสต๊อก
  //         try {
  //             tool = await Tool.findById(histool.tid);
  //         } catch (err) {
  //             const error = new HttpError(
  //                 'Something went wrong, could not find a tool in forLoop.',
  //                 500
  //             );
  //             return next(error);
  //         }
  //         let createActionEditTool =
  //         {
  //             code: histool.code + "-2",
  //             username: username,
  //             total: 0,
  //             status: status,
  //             date: new Date().toString(),
  //             description: description,
  //             actionType: "restore",
  //         }
  //         tool.total = tool.total + histool.total
  //         histool.actionEdit = [...histool.actionEdit, createActionEditTool]
  //         histool.total = 0
  //         // หลังจากแก้ไขข้อมูลแล้วให้เริ่มบันทึกข้อมูล
  //         try {
  //             await tool.save()
  //         } catch (err) {
  //             const error = new HttpError(
  //                 'Something went wrong, could not save a tool in process forLoop.',
  //                 500
  //             );
  //             return next(error);
  //         }
  //         try {
  //             await histool.save()
  //         } catch (err) {
  //             const error = new HttpError(
  //                 'Something went wrong, could not save a histool in process forLoop.',
  //                 500
  //             );
  //             return next(error);
  //         }
  //     } else {
  //         console.log("no data tool")
  //     }
  // }
  // // เริ่มแก้ไขข้อมูลบอร์ด
  // let board;
  // try {
  //     board = await Board.findById(histboard.bid);
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not find a board.',
  //         500
  //     );
  //     return next(error);
  // }
  // board.total = board.total + histboard.total
  // try {
  //     await board.save()
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not save a board.',
  //         500
  //     );
  //     return next(error);
  // }
  // // เริ่มแก้ไขข้อมูลประวัติการเบิกบอร์ด
  // let createActionEditBoard =
  // {
  //     code: histboard.code + "-2",
  //     username: username,
  //     total: 0,
  //     status: status,
  //     date: new Date().toString(),
  //     description: description,
  //     actionType: "restore"
  // }
  // histboard.total = 0;
  // histboard.actionEdit = [...histboard.actionEdit, createActionEditBoard]
  // try {
  //     await histboard.save()
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not save a hisboard.',
  //         500
  //     );
  //     return next(error);
  // }
  // // ส่งข้อมูลไปยัง frontend
  // let histbList;
  // try {
  //     histbList = await HistoryBoard.find();
  // } catch (err) {
  //     const error = new HttpError(
  //         'Something went wrong, could not fetch data of hisboard.',
  //         500
  //     );
  //     return next(error);
  // }
  // res.status(200).json(histbList);
  // console.log("restore succussfully")
};

// การยกเลิกเบิกบอร์ด กรณี อุปกรณ์ไม่ครบ
const cancelRequestBoardandIncomplete = async (req, res, next) => {
  //     const { username, status, toolsId, description, incompleteId } = req.body
  //     let histboard;
  //     try {
  //         histboard = await HistoryBoard.findById(req.params.htbid);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find a histboard.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     for (var round = 0; round < toolsId.length; round++) {
  //         let histool;
  //         let sum;
  //         // หาค่าจำนวนอุปกรณ์ที่ใช้ไปก่อนหน้านี้
  //         try {
  //             histool = await HistoryTool.findById(toolsId[round]);
  //         } catch (err) {
  //             const error = new HttpError(
  //                 'Something went wrong, could not find a history-tool in forLoop.',
  //                 500
  //             );
  //             return next(error);
  //         }
  //         if (histool.isDeleted === false) {
  //             // หาอุปกรณ์ต่อโดยใช้ข้อมูลในประวัติอุปกรณ์ในการค้นหา
  //             try {
  //                 tool = await Tool.findById(histool.tid);
  //             } catch (err) {
  //                 const error = new HttpError(
  //                     'Something went wrong, could not find a tool in forLoop.',
  //                     500
  //                 );
  //                 return next(error);
  //             }
  //             let createActionEditTool =
  //             {
  //                 code: histool.code + "-" + (histool.actionEdit.length + 1),
  //                 username: username,
  //                 total: 0,
  //                 status: status,
  //                 date: new Date().toString(),
  //                 description: description,
  //                 actionType: "restore",
  //             }
  //             // คืนของไปยังสต๊อก
  //             sum = tool.total + histool.total
  //             tool.total = sum
  //             histool.actionEdit = [...histool.actionEdit, createActionEditTool]
  //             histool.total = 0
  //             // หลังจากแก้ไขข้อมูลแล้วให้เริ่มบันทึกข้อมูล
  //             try {
  //                 await tool.save()
  //             } catch (err) {
  //                 const error = new HttpError(
  //                     'Something went wrong, could not save a tool in process forLoop.',
  //                     500
  //                 );
  //                 return next(error);
  //             }
  //             try {
  //                 await histool.save()
  //             } catch (err) {
  //                 const error = new HttpError(
  //                     'Something went wrong, could not save a histool in process forLoop.',
  //                     500
  //                 );
  //                 return next(error);
  //             }
  //         } else {
  //             console.log("no data tool")
  //         }
  //     }
  //     // ลบหน้าอุปกรณ์คงค้าง
  //     let incompleteBoard;
  //     // console.log(incompleteId)
  //     try {
  //         incompleteBoard = await IncompleteTool.findById(incompleteId);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find a tool in forLoop.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     try {
  //         await incompleteBoard.remove()
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not delete a incompleteBoard.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // แก้ไขข้อมูลหน้ารายการอุปกรณ์
  //     let board;
  //     try {
  //         board = await Board.findById(histboard.bid);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find a board.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     board.total = board.total + histboard.total
  //     try {
  //         await board.save()
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a board.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // เริ่มแก้ไขข้อมูลประวัติการเบิกบอร์ด
  //     let createActionEditBoard =
  //     {
  //         code: histboard.code + "-" + (histboard.actionEdit.length + 1),
  //         username: username,
  //         total: 0,
  //         status: status,
  //         date: new Date().toString(),
  //         description: description,
  //         actionType: "restore"
  //     }
  //     histboard.total = 0;
  //     histboard.actionEdit = [...histboard.actionEdit, createActionEditBoard]
  //     try {
  //         await histboard.save()
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a hisboard.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // ส่งข้อมูลไปยัง frontend
  //     let histbList;
  //     try {
  //         histbList = await HistoryBoard.find();
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not fetch data of hisboard.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     res.status(200).json(histbList);
  //     console.log("restore succussfully")
  // }
  // // การคืนของ กรณี อุปกรณ์ไม่ครบ
  // const updateIncompleteBoard = async (req, res, next) => {
  //     const { tid, htid, description, username, status, tools } = req.body;
  //     let total = Number(req.body.total)
  //     let tool;
  //     let histool;
  //     let incompleteBoard;
  //     // หาข้อมูลอุปกรณ์
  //     try {
  //         tool = await Tool.findById(tid);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find a tool.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     try {
  //         histool = await HistoryTool.findById(htid);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find a history-tool.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     try {
  //         incompleteBoard = await IncompleteTool.findById(req.params.incompleteId);
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not find a IncompleteBoard.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     // เริ่มแก้ไขจำนวนอุปกรณ์ในสต๊อก
  //     let calTotalTool = tool.total - total
  //     let newAction;
  //     if (calTotalTool !== 0) {
  //         newAction = "requestIncomplete"
  //     } else {
  //         newAction = "requestFromBoard"
  //     }
  //     // console.log(calTotalTool)
  //     tool.total = calTotalTool
  //     // เริ่มแก้ไขประวัติการเบิกบอร์ด
  //     let createActionEdit =
  //     {
  //         code: histool.code + "-" + (histool.actionEdit.length + 1),
  //         username: username,
  //         total: total,
  //         status: status,
  //         date: new Date().toString(),
  //         description: description,
  //         actionType: newAction
  //     }
  //     let calHistool = histool.total + total
  //     // console.log(calHistool)
  //     histool.total = calHistool
  //     histool.actionEdit = [...histool.actionEdit, createActionEdit]
  //     // เริ่มแก้ไขข้อมูลหน้าอุปกรณ์ไม่ครบ
  //     if (tools.length > 0) {
  //         incompleteBoard.tools = tools
  //         // console.log("leng > 0")
  //         // console.log(tools)
  //         try {
  //             await incompleteBoard.save()
  //             console.log("save success")
  //         } catch (err) {
  //             const error = new HttpError(
  //                 'Something went wrong, could not save a incompleteBoard.',
  //                 500
  //             );
  //             return next(error);
  //         }
  //     } else if (tools.length === 0) {
  //         console.log("leng = 0")
  //         try {
  //             await incompleteBoard.remove()
  //         } catch (err) {
  //             const error = new HttpError(
  //                 'Something went wrong, could not delete a incompleteBoard.',
  //                 500
  //             );
  //             return next(error);
  //         }
  //     }
  //     try {
  //         await tool.save()
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a tool.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     try {
  //         await histool.save()
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not save a history-tool.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     let incompleteBoardList;
  //     try {
  //         incompleteBoardList = await IncompleteTool.find();
  //     } catch (err) {
  //         const error = new HttpError(
  //             'Something went wrong, could not fetching a incomplete-tool.',
  //             500
  //         );
  //         return next(error);
  //     }
  //     res.status(200).json(incompleteBoardList);
  //     console.log("update incompleteBoard successfully")
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
exports.getIncompleteBoard = getIncompleteBoard;
exports.editBoard = editBoard;
exports.actionBoard = actionBoard;
exports.requestBoard = requestBoard;
exports.checkBoardEquipment = checkBoardEquipment;
exports.requestBoardandIncompleteTool = requestBoardandIncompleteTool;
exports.createBoard = createBoard;
exports.restoreBoard = restoreBoard;
exports.restoreBoardandTools = restoreBoardandTools;
exports.cancelRequestBoard = cancelRequestBoard;
exports.cancelRequestBoardandIncomplete = cancelRequestBoardandIncomplete;
// exports.updateIncompleteBoard = updateIncompleteBoard;
exports.deleteBoard = deleteBoard;
