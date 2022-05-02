const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Board = require("../models/boardModel");
const Tool = require("../models/toolModel");
const NumHistory = require("../models/numHistory");
const BoardHistory = require("../models/boardHistoryModel");
const {
  hasImage,
  calculateLeftItem,
  definedAction,
  calculateAndRestoreItem,
  hasItem,
  hasFile,
  handleSelectedItem,
} = require("../utils/index");
const {
  handleOneImage,
  handleManyImages,
  deleteAllImage,
  deleteOneImage,
  uploadOneImage,
} = require("../utils/handleImage");
const { handleNotification } = require("../utils/notification");
// const { io } = require("../app");
// console.log(io);

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
  const { tools, boardName, boardCode, type, description, creator } = req.body;
  const board = new Board({
    boardName,
    boardCode,
    type,
    description,
    creator,
  });
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

  // *** Using socket.io for sending data ***
  // Do it here later

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

  // *** Using socket.io for sending board data ***
  // Do it here later

  sendResponse(board, 200, res);
});

exports.checkAllToolOfBoard = catchAsync(async (req, res, next) => {
  const givenBoard = Number(req.body.total);
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
    if (leftoverTool <= 0) {
      dataCalulated.insufficientTool += 1;
    }
    dataCalulated.tools.push({
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
  const board = await Board.findById(boardHistory.board);
  if (!board) return next(new AppError("ไม่พบรายการบอร์ดนี้", 404));
  // await handleNotification(board, "บอร์ด", board.boardName);

  // let newTag = {
  //   creator: req.user.id,
  //   action: newActionName,
  //   total: boardHistory.total,
  //   description: req.body.description,
  // };
  // boardHistory.action = newActionName;
  // boardHistory.description = req.body.description;
  // boardHistory.tags.push(newTag);

  // await boardHistory.save();
  // await board.save();

  // *** Using socket.io for sending board data ***
  // Do it here later

  sendResponse(board, 200, res);
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
