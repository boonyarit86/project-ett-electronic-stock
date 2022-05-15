const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Board = require("../models/boardModel");
const Tool = require("../models/toolModel");
const NumHistory = require("../models/numHistory");
const BoardHistory = require("../models/boardHistoryModel");
const ToolHistory = require("../models/toolHistoryModel");
const InsufficientTool = require("../models/insufficientToolModel");
const {
  hasImage,
  calculateLeftItem,
  definedAction,
  calculateAndRestoreItem,
  hasItem,
  hasFile,
  handleSelectedItem,
  isItemOut,
} = require("../utils/index");
const {
  handleOneImage,
  handleManyImages,
  deleteAllImage,
  deleteOneImage,
  uploadOneImage,
} = require("../utils/handleImage");
const { handleNotification } = require("../utils/notification");
const { io } = require("../app");

// UTILITIES
const sendResponse = (board, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    tools: board?.tools?.length || 0,
    data: {
      board,
    },
  });
};

const deleteExpireditem = async (data) => {
  let docs = [];
  if (data.length > 0) {
    data.forEach(async (item) => {
      let expHistory = new Date(item.exp).getTime();
      let currentDate = new Date().getTime();
      if (item.board === null && expHistory < currentDate) {
        await BoardHistory.findByIdAndDelete(item.id);
        return;
      }
      docs.push(item);
    });
  }
  return docs;
};

const factoryData = (doc) => {
  if (doc.tools.length > 0) {
    let newToolList = doc.tools.map((tool) => {
      tool.type.categories = null;
      return tool;
    });
    doc.tools = newToolList;
  }
  return doc;
};

const getUpdatedBoard = async (id) => {
  const doc = await Board.findById(id)
    .populate({
      path: "tools.detail",
      select: "toolName toolCode size avatar",
    })
    .populate({ path: "tools.type", select: "name" })
    .populate({ path: "tools.category", select: "name" });
  return doc;
};

const getUpdatedBoardHistory = async (id) => {
  const doc = await BoardHistory.findById(id)
  .populate({ path: "creator", select: "name role" })
  .populate({ path: "board", select: "boardName boardCode" })
  .populate({ path: "tags.creator", select: "name role" })
  .populate({ path: "tags.tools.tool", select: "toolName" });
  return doc;
};

exports.getAllBoards = catchAsync(async (req, res, next) => {
  const boards = await Board.find();
  let docs;
  if (boards.length > 0) {
    docs = boards.map((doc) => {
      let result = factoryData(doc);
      return result;
    });
  }

  res.status(200).json({
    status: "success",
    results: boards.length,
    data: {
      docs,
    },
  });
});

exports.getAllBoardHistory = catchAsync(async (req, res, next) => {
  const boardHistories = await BoardHistory.find();
  const docs = await deleteExpireditem(boardHistories);

  res.status(200).json({
    status: "success",
    results: docs.length,
    data: {
      boardHistories: docs,
    },
  });
});

exports.getAllInsufficientToolList = catchAsync(async (req, res, next) => {
  const insufficientToolList = await InsufficientTool.find();

  // *** Do it later ***
  // 1. Remove tool in array that equals null value, before sending to frontend.

  res.status(200).json({
    status: "success",
    results: insufficientToolList.length,
    data: {
      insufficientToolList,
    },
  });
});

exports.getBoard = catchAsync(async (req, res, next) => {
  const board = await Board.findById(req.params.bid);
  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));
  if (hasItem(board.tools)) {
    board.tools = board.tools.filter((item) => item?.toolName !== null);
    await board.save();
  }

  let doc = factoryData(board);
  sendResponse(doc, 200, res);
});

exports.createBoard = catchAsync(async (req, res, next) => {
  const { boardName, boardCode, type, description } = req.body;
  const board = new Board({
    boardName,
    boardCode,
    type,
    description,
  });
  // For testing on postman
  // const tools = req.body.tools;

  // For client
  const tools = JSON.parse(req.body.tools);
  board.creator = req.user._id;
  let err = { message: null, status: 400 };
  await handleSelectedItem(board, tools, err);
  if (err.message !== null) {
    return next(new AppError(err.message, err.status));
  }
  await board.save();
  if (hasFile(req.file)) {
    await uploadOneImage(req.file.path, board);
    await board.save({ validateBeforeSave: false });
  }

  let docUpdated = await getUpdatedBoard(board._id);
  io.emit("board-adding", docUpdated);

  sendResponse(board, 201, res);
});

exports.editBoard = catchAsync(async (req, res, next) => {
  const { boardName, boardCode, type, limit, avatar, tools, description } =
    req.body;
  const newAvatar = Boolean(req.files?.newAvatar) ? req.files.newAvatar[0] : {};
  const newImages = Boolean(req.files?.newImages) ? req.files.newImages : [];
  // Resolve this array to be req.body.imagesDeleted later.
  const imagesDeleted = [
    // { public_id: "dmohmelibcgoywivwwf5" },
    // { public_id: "paqwiqksgehtgezrdrby" },
  ];
  const board = await Board.findById(req.params.bid);
  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));

  board.boardName = boardName;
  board.boardCode = boardCode;
  board.type = type;
  board.limit = limit;
  board.description = description;
  let err = { message: null, status: 400 };
  await handleSelectedItem(board, tools, err);
  if (err.message !== null) {
    return next(new AppError(err.message, err.status));
  }
  await board.save();

  await handleOneImage(board, newAvatar, avatar);
  await board.save({ validateBeforeSave: false });
  await handleManyImages(board, newImages, imagesDeleted);
  await board.save({ validateBeforeSave: false });
  sendResponse(board, 200, res);
});

exports.boardAction = catchAsync(async (req, res, next) => {
  const givenBoard = Number(req.body.total);
  const action = req.body.action;
  const CONSTRAINT = ["add", "request"];
  if (!CONSTRAINT.includes(action)) {
    return next(new AppError("ไม่มี function นี้", 400));
  }
  if (givenBoard <= 0)
    return next(new AppError("จำนวนบอร์ดต้องมีค่าอย่างน้อย 1", 400));
  const board = await Board.findById(req.params.bid);
  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));
  if (board.total < givenBoard && action === "request") {
    return next(new AppError("จำนวนบอร์ดที่ต้องการเบิกมีมากกว่าในสต๊อก", 400));
  }
  const numHistory = await NumHistory.findById("626d00c8b1b7113cb4da1695");
  if (!numHistory)
    return next(new AppError("ไม่พบข้อมูลรหัสประวัติการใช้งาน", 404));
  // Adding or Requesting
  let newActionName = calculateLeftItem(action, "บอร์ด", givenBoard, board);
  await handleNotification(board, "บอร์ด", board.boardName);

  let newHistoryBoard = new BoardHistory({
    code: `${numHistory.name}${numHistory.countNumber}`,
    board: board.id,
    creator: req.user.id,
    total: givenBoard,
    action: newActionName,
    description: req.body.description,
    tags: [
      {
        creator: req.user.id,
        action: newActionName,
        total: givenBoard,
        description: req.body.description,
      },
    ],
  });

  numHistory.countNumber += 1;

  await numHistory.save();
  await newHistoryBoard.save();
  await board.save();

  io.emit("board-action", { bid: board._id, total: board.total });

  sendResponse(board, 200, res);
});

exports.restoreBoard = catchAsync(async (req, res, next) => {
  const boardHistory = await BoardHistory.findById(req.params.bhid);
  if (!boardHistory)
    return next(new AppError("ไม่พบประวัติรายการบอร์ดนี้", 404));
  if (boardHistory.action.startsWith("ยกเลิก")) {
    return next(new AppError("ข้อมูลนี้ไม่สามารถดำเนินการได้", 400));
  }
  const board = await Board.findById(boardHistory.board);
  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));
  let action = definedAction(boardHistory.action);
  if (boardHistory.total > board.total && action === "add") {
    return next(
      new AppError(
        `จำนวนบอร์ดที่ต้องการขอคืนมีมากกว่าในสต๊อก ${boardHistory.total}:${board.total}`,
        400
      )
    );
  }
  let newActionName = calculateAndRestoreItem(
    action,
    "บอร์ด",
    boardHistory.total,
    board
  );
  await handleNotification(board, "บอร์ด", board.boardName);

  let newTag = {
    creator: req.user.id,
    action: newActionName,
    total: boardHistory.total,
    description: req.body.description,
  };
  boardHistory.action = newActionName;
  boardHistory.description = req.body.description;
  boardHistory.tags.push(newTag);

  await boardHistory.save();
  await board.save();

  let docUpdated = await getUpdatedBoardHistory(req.params.bhid);
  io.emit("board-action", { bid: board._id, total: board.total });

  res.status(200).json({
    status: "success",
    data: {
      doc: docUpdated,
    },
  });
});

exports.checkAllToolOfBoard = catchAsync(async (req, res, next) => {
  const givenBoard = Number(req.params.total);
  const board = await Board.findById(req.params.bid);
  const dataCalulated = {
    board: { total: 0, leftover: 0 },
    tools: [],
    insufficientTool: 0,
  };
  if (givenBoard <= 0) {
    return next(new AppError("จำนวนบอร์ดต้องมีค่าอย่างน้อย 1", 400));
  }
  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));
  if (!hasItem(board.tools)) {
    return next(
      new AppError("function นี้ต้องมีอุปกรณ์อย่างน้อย 1 เพื่อดำเนินการ", 400)
    );
  }
  if (givenBoard > board.total) {
    return next(
      new AppError(
        `จำนวนบอร์ดที่ต้องการใช้มีมากกว่าในสต๊อก ${givenBoard}:${board.total}`,
        400
      )
    );
  }

  // Calculating leftover tool
  let isNotToolFound = null;
  for (let r = 0; r < board.tools.length; r++) {
    let tid = board.tools[r].detail.id;
    let tool = await Tool.findById(tid);
    if (!tool) {
      isNotToolFound = true;
      break;
    }
    let toolUsed = board.tools[r].total * givenBoard;
    let leftoverTool = tool.total - toolUsed;
    if (leftoverTool < 0) {
      dataCalulated.insufficientTool += 1;
    }
    dataCalulated.tools.push({
      tid: tid,
      toolName: tool.toolName,
      total: toolUsed,
      toolCalc: leftoverTool,
    });
  }

  if (isNotToolFound) {
    return next(
      new AppError(
        "ไม่พบรายการอุปกรณ์บางอย่างในฐานข้อมูล โปรดอัปเดตข้อมูลรายการบอร์ดนี้ หน้ารายละเอียดบอร์ดอีกครั้ง",
        404
      )
    );
  }

  // Calcualting leftover board
  let calcBoard = board.total - givenBoard;
  dataCalulated.board.total = givenBoard;
  dataCalulated.board.leftover = calcBoard;
  // All tools and board are ready applying.
  if (calcBoard > 0 && dataCalulated.insufficientTool === 0) {
    dataCalulated.status = "success";
  }
  // board is ready applying, but some tools isn't.
  if (dataCalulated.insufficientTool > 0) {
    dataCalulated.status = "warning";
  }

  res.status(200).json({
    status: "success",
    data: dataCalulated,
  });
});

exports.requestBoard = catchAsync(async (req, res, next) => {
  const givenBoard = Number(req.body.total);
  const tools = req.body.tools;
  const insufficientToolList = [];
  const toolUsedInBoardList = [];
  let isToolEnough = true;

  if (givenBoard <= 0) {
    return next(new AppError("จำนวนบอร์ดต้องมีค่าอย่างน้อย 1", 400));
  }
  const board = await Board.findById(req.params.bid);
  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));
  const numBoardHistory = await NumHistory.findById("626d00c8b1b7113cb4da1695");
  const numToolHistory = await NumHistory.findById("626d011f9857ade448157c24");
  if (!numBoardHistory || !numToolHistory) {
    return next(new AppError("ไม่พบข้อมูลรหัสประวัติการใช้งาน", 404));
  }
  if (givenBoard > board.total) {
    return next(
      new AppError(
        `จำนวนบอร์ดที่ต้องการใช้มีมากกว่าในสต๊อก ${givenBoard}:${board.total}`,
        400
      )
    );
  }
  if (!hasItem(tools)) {
    return next(
      new AppError("function นี้ต้องมีอุปกรณ์อย่างน้อย 1 เพื่อดำเนินการ", 400)
    );
  }

  // Check board
  board.total -= givenBoard;
  let newBoardHistory = new BoardHistory({
    code: `${numBoardHistory.name}${numBoardHistory.countNumber}`,
    board: board.id,
    creator: req.user.id,
    total: givenBoard,
    description: req.body.description,
  });
  numBoardHistory.countNumber += 1;

  let newTagOfBoard = {
    creator: req.user.id,
    total: givenBoard,
    description: req.body.description,
  };

  // Check Tool
  let isNotToolFound = null;
  // some obj data waiting to save will be save later simultaneously.
  let pendingData = [];
  for (let r = 0; r < tools.length; r++) {
    const tool = await Tool.findById(tools[r].tid);
    const givenTool = tools[r].total;
    let action = "เบิกบอร์ดพร้อมกับอุปกรณ์";
    let newToolHistory = new ToolHistory({
      code: `${numToolHistory.name}${numToolHistory.countNumber}`,
      tool: tool.id,
      creator: req.user.id,
      description: req.body.description,
      tags: [
        {
          creator: req.user.id,
          description: req.body.description,
          board: board.id,
          bhCode: newBoardHistory.code,
        },
      ],
    });

    if (!tool) {
      isNotToolFound = true;
      break;
    }
    let calcTool = tool.total - givenTool;
    // In case, Tool is not enough
    if (calcTool < 0) {
      newToolHistory.total = tool.total;
      newToolHistory.tags[0].total = tool.total;
      newToolHistory.tags[0].allToolTotalUsed = tool.total;
      // -5 => --5 => 5
      newToolHistory.tags[0].insufficientTotal = -calcTool;
      // Remaining tool in stock
      isToolEnough = false;
      action = "เบิกบอร์ดพร้อมกับอุปกรณ์ (อุปกรณ์ไม่ครบ)";
      insufficientToolList.push({
        type: tool.type,
        category: tool.category,
        detail: tool.id,
        insufficientTotal: -calcTool,
        th: newToolHistory.id,
      });
      toolUsedInBoardList.push({
        total: tool.total,
        insufficientTotal: -calcTool,
        tool: tool.id,
        th: newToolHistory.id,
      });
      tool.total = 0;
    } else {
      newToolHistory.total = givenTool;
      newToolHistory.tags[0].total = givenTool;
      newToolHistory.tags[0].allToolTotalUsed = givenTool;
      // -5 => --5 => 5
      newToolHistory.tags[0].insufficientTotal = 0;
      // Remaining tool in stock
      tool.total = calcTool;
      toolUsedInBoardList.push({
        total: givenTool,
        insufficientTotal: 0,
        tool: tool.id,
        th: newToolHistory.id,
      });
    }

    newToolHistory.action = action;
    newToolHistory.tags[0].action = action;
    numToolHistory.countNumber += 1;

    pendingData.push(tool);
    pendingData.push(newToolHistory);
    await handleNotification(tool, "อุปกรณ์", tool.toolName);
  } // end loop

  if (isNotToolFound) {
    return next(
      new AppError(
        "ไม่พบรายการอุปกรณ์บางอย่างในฐานข้อมูล โปรดอัปเดตข้อมูลรายการบอร์ดนี้ หน้ารายละเอียดบอร์ดอีกครั้ง",
        404
      )
    );
  }

  let actionName = "เบิกบอร์ดพร้อมกับอุปกรณ์";
  if (!isToolEnough) {
    actionName = "เบิกบอร์ดพร้อมกับอุปกรณ์ (อุปกรณ์ไม่ครบ)";
    let newInsufficientTool = new InsufficientTool({
      bh: newBoardHistory.id,
      creator: req.user.id,
      tools: insufficientToolList,
    });
    newBoardHistory.insufficientToolId = newInsufficientTool.id;
    pendingData.push(newInsufficientTool);
  }
  newTagOfBoard.action = actionName;
  newTagOfBoard.tools = toolUsedInBoardList;

  newBoardHistory.action = actionName;
  newBoardHistory.tags.push(newTagOfBoard);
  pendingData.push(newBoardHistory);

  await handleNotification(board, "บอร์ด", board.boardName);
  await board.save();
  await Promise.all([
    pendingData.map(async (doc) => {
      await doc.save();
    }),
  ]);
  await numBoardHistory.save();
  await numToolHistory.save();

  for (let r = 0; r < tools.length; r++) {
    let tool = await Tool.findById(tools[r].tid);
    if (tool) {
      io.emit("tool-action", { tid: tool._id, total: tool.total });
    }
  }
  io.emit("board-action", { bid: board._id, total: board.total });

  sendResponse(pendingData, 200, res);
});

exports.requestInsufficientTool = catchAsync(async (req, res, next) => {
  const { description, tid } = req.body;
  const givenTool = Number(req.body.total);
  if (givenTool <= 0)
    return next(new AppError("จำนวนอุปกรณ์ต้องมีค่าอย่างน้อย 1", 400));
  const insufficientToolList = await InsufficientTool.findById(
    req.params.insuffiTool_id
  );
  if (!insufficientToolList) {
    return next(
      new AppError(
        `ไม่พบข้อมูลรายการอุปกรณ์ไม่ครบนี้ โปรดรีเฟรชหน้าจออีกครั้งเพื่ออัปเดตข้อมูล`,
        400
      )
    );
  }

  let insuffiTool = insufficientToolList.tools.find(
    (item) => item.detail.id === tid
  );
  let tool = await Tool.findById(insuffiTool.detail);
  if (!tool) return next(new AppError("ไม่พบรายการอุปกรณ์นี้", 404));
  let boardHistory = await BoardHistory.findById(insufficientToolList.bh);
  if (!boardHistory) {
    return next(new AppError("ไม่พบประวัติรายการบอร์ดนี้", 404));
  }
  let toolHistory = await ToolHistory.findById(insuffiTool.th);
  if (!toolHistory) {
    return next(new AppError("ไม่พบประวัติรายการอุปกรณ์นี้", 404));
  }

  if (givenTool > tool.total) {
    return next(
      new AppError(
        `จำนวนอุปกรณ์ที่ต้องการใช้มีมากกว่าในสต๊อก ${givenTool}:${tool.total}`,
        400
      )
    );
  }

  // Update tool in stock
  let calcToolInStock;
  let toolUsed;
  let action = "เบิกบอร์ดพร้อมกับอุปกรณ์";

  // Update insufficient tool
  let insufficientToolLeft;
  if (
    givenTool > insuffiTool.insufficientTotal ||
    givenTool === insuffiTool.insufficientTotal
  ) {
    // 10 & 8 => 10 - (10 - 8)
    calcToolInStock = tool.total - insuffiTool.insufficientTotal;
    toolUsed = insuffiTool.insufficientTotal;
    insufficientToolLeft = 0;
    insufficientToolList.tools = insufficientToolList.tools.filter(
      (item) => item.detail.id !== tid
    );
  } else {
    // 100 - 5 = 95
    calcToolInStock = tool.total - givenTool;
    toolUsed = givenTool;
    // 10 - 5 = 5
    insufficientToolLeft = insuffiTool.insufficientTotal - givenTool;
    insufficientToolList.tools.map((item) => {
      if (item.detail.id === tid) {
        item.insufficientTotal = insufficientToolLeft;
      }
      return item;
    });
    action = "เบิกบอร์ดพร้อมกับอุปกรณ์ (อุปกรณ์ไม่ครบ)";
  }
  tool.total = calcToolInStock;

  // Update board tag
  let prevTagOfBoard = boardHistory.tags[boardHistory.tags.length - 1];
  let newToolArr = [];
  prevTagOfBoard.tools.map((item) => {
    let obj = {
      total: item.total,
      insufficientTotal: item.insufficientTotal,
      tool: item.tool,
      th: item.th,
    };
    newToolArr.push(obj);
  });
  newToolArr.map((item) => {
    if (item.tool._id.toString() === tid) {
      item.total += toolUsed;
      item.insufficientTotal -= toolUsed;
    }
    return item;
  });
  let newTagOfBoard = {
    creator: req.user.id,
    total: prevTagOfBoard.total,
    description: description,
    tools: newToolArr,
  };
  let isAllToolOut = newToolArr.every((item) => item.insufficientTotal === 0);
  if (isAllToolOut) boardHistory.action = "เบิกบอร์ดพร้อมกับอุปกรณ์";
  newTagOfBoard.action = boardHistory.action;
  boardHistory.tags.push(newTagOfBoard);

  // Update tool tag
  let prevTagOfTool = toolHistory.tags[toolHistory.tags.length - 1];
  let newTagOfTool = {
    creator: req.user.id,
    board: prevTagOfTool.board,
    description: description,
    bhCode: prevTagOfTool.bhCode,
    total: toolUsed,
    allToolTotalUsed: prevTagOfTool.allToolTotalUsed + toolUsed,
    insufficientTotal: prevTagOfTool.insufficientTotal - toolUsed,
    action: action,
  };
  toolHistory.tags.push(newTagOfTool);
  toolHistory.total += toolUsed;
  toolHistory.action = action;

  // Create notification
  await handleNotification(tool, "อุปกรณ์", tool.toolName);

  // Starting saving all documents
  await tool.save();
  await boardHistory.save();
  await toolHistory.save();

  // Update insufficient tool
  if (isItemOut(insufficientToolList.tools.length)) {
    await insufficientToolList.remove();
  } else {
    await insufficientToolList.save();
  }

  io.emit("tool-action", { tid: tool._id, total: tool.total });
  const docsUpdated = await InsufficientTool.find();
  res.status(200).json({
    status: "success",
    results: docsUpdated.length,
    data: {
      insufficientToolList: docsUpdated,
    },
  });
});

exports.restoreBoardWithTool = catchAsync(async (req, res, next) => {
  const action = "ยกเลิกเบิกบอร์ดพร้อมกับอุปกรณ์";
  let pendingData = [];
  const boardHistory = await BoardHistory.findById(req.params.bhid);
  if (!boardHistory) {
    return next(new AppError("ไม่พบประวัติรายการบอร์ดนี้", 404));
  }
  if (boardHistory.action.includes("ยกเลิก")) {
    return next(new AppError("ข้อมูลนี้ไม่สามารถดำเนินการได้", 400));
  }
  // Update Board
  const bid = boardHistory.board.id;
  const board = await Board.findById(bid);

  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));
  board.total += boardHistory.total;
  board.action = action;
  if (board.total > board.limit) {
    board.isAlert = false;
  }
  // Update board history
  const prevTagOfBoardHistory = boardHistory.tags[boardHistory.tags.length - 1];
  let newToolArr = [];
  prevTagOfBoardHistory.tools.map((item) => {
    let obj = {
      total: item.total,
      insufficientTotal: item.insufficientTotal,
      tool: item.tool,
      th: item.th,
    };
    newToolArr.push(obj);
  });
  newToolArr.map(async (item) => {
    item.insufficientTotal = 0;
    return item;
  });
  let newTagOfBoardHistory = {
    creator: req.user.id,
    total: prevTagOfBoardHistory.total,
    action: action,
    description: req.body.description,
    tools: newToolArr,
  };
  boardHistory.tags.push(newTagOfBoardHistory);
  boardHistory.action = action;
  for (let r = 0; r < newToolArr.length; r++) {
    let item = newToolArr[r];
    // Update Tool History
    const toolHistory = await ToolHistory.findById(item.th);
    if (toolHistory) {
      const prevTagOfToolHistory =
        toolHistory.tags[toolHistory.tags.length - 1];
      let newTagOfTool = {
        creator: req.user.id,
        board: prevTagOfToolHistory.board,
        description: req.body.description,
        bhCode: prevTagOfToolHistory.bhCode,
        total: 0,
        allToolTotalUsed: item.total,
        insufficientTotal: 0,
        action: action,
      };
      toolHistory.action = action;
      toolHistory.tags.push(newTagOfTool);

      // Update Tool
      const tool = await Tool.findById(item.tool);
      if (tool) {
        tool.total += item.total;
        if (tool.total > tool.limit) {
          tool.isAlert = false;
        }
        pendingData.push(tool);
        pendingData.push(toolHistory);

        io.emit("tool-action", { tid: tool._id, total: tool.total });
      }
    }
  }
  pendingData.push(boardHistory);
  pendingData.push(board);

  await Promise.all([
    pendingData.map(async (doc) => {
      await doc.save();
    }),
  ]);

  const insufficientToolList = await InsufficientTool.findById(
    boardHistory.insufficientToolId
  );
  if (insufficientToolList) {
    await insufficientToolList.remove();
    io.emit("inst-deleting", { instId: boardHistory.insufficientToolId });
  }

  let docUpdated = await getUpdatedBoardHistory(req.params.bhid);
  io.emit("board-action", { bid: board._id, total: board.total });

  res.status(200).json({
    status: "success",
    data: {
      doc: docUpdated,
    },
  });
});

exports.deleteBoard = catchAsync(async (req, res, next) => {
  const board = await Board.findById(req.params.bid);
  if (!board) return next(new AppError("ไม่บอร์ดนี้", 404));

  if (hasImage(board?.avatar)) {
    await deleteOneImage(board.avatar?.public_id, null);
  }
  await deleteAllImage(board.images);
  await board.remove();

  // *** Using socket.io for sending tool data ***
  // Do it here later

  sendResponse(null, 204, res);
});
