const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Tool = require("../models/toolModel");
const NumHistory = require("../models/numHistory");
const ToolHistory = require("../models/toolHistoryModel");
const {
  hasImage,
  calculateLeftItem,
  definedAction,
  calculateAndRestoreItem,
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
const sendResponse = (tool, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    data: {
      tool,
    },
  });
};

exports.getAllTools = catchAsync(async (req, res, next) => {
  const tools = await Tool.find();

  res.status(200).json({
    status: "success",
    results: tools.length,
    data: {
      tools,
    },
  });
});

exports.getTool = catchAsync(async (req, res, next) => {
  const tool = await Tool.findById(req.params.tid);
  if (!tool) return next(new AppError("ไม่พบรายการอุปกรณ์นี้", 404));
  sendResponse(tool, 200, res);
});

exports.createTool = catchAsync(async (req, res, next) => {
  const tool = new Tool(req.body);
  await tool.save();
  await uploadOneImage(req.file.path, tool)
  tool.size = "small";
  await tool.save({ validateBeforeSave: false });
  sendResponse(tool, 201, res);
});

exports.editTool = catchAsync(async (req, res, next) => {
  // Bug Fixed: Save tool data before images
  const { toolName, toolCode, type, category, limit, total, size, avatar } =
    req.body;
  const newAvatar = Boolean(req.files?.newAvatar) ? req.files.newAvatar[0] : {};
  const newImages = Boolean(req.files?.newImages) ? req.files.newImages : [];
  // Resolve this array to be req.body.imagesDeleted later.
  const imagesDeleted = [
    // { public_id: "mhotn5zxyglw3a3t5tqs" },
    // { public_id: "lra3v2ap88tpqz7ebldx" },
  ];
  const tool = await Tool.findById(req.params.tid);
  if (!tool) return next(new AppError("ไม่พบรายการอุปกรณ์นี้", 404));

  tool.toolName = toolName;
  tool.toolCode = toolCode;
  tool.type = type;
  tool.category = category;
  tool.limit = limit;
  tool.total = total;
  tool.size = size;
  await tool.save();

  await handleOneImage(tool, newAvatar, avatar);
  await handleManyImages(tool, newImages, imagesDeleted);
  await tool.save({ validateBeforeSave: false });
  sendResponse(tool, 200, res);
});

exports.toolAction = catchAsync(async (req, res, next) => {
  const givenTool = Number(req.body.total);
  const action = req.body.action;
  const CONSTRAINT = ["add", "request"];
  if (!CONSTRAINT.includes(action)) {
    return next(new AppError("ไม่มี function นี้", 400));
  }
  if (givenTool <= 0)
    return next(new AppError("จำนวนอุปกรณ์ต้องมีค่าอย่างน้อย 1", 400));
  const tool = await Tool.findById(req.params.tid);
  if (!tool) return next(new AppError("ไม่พบรายการอุปกรณ์นี้", 404));
  if (tool.total < givenTool && action === "request") {
    return next(
      new AppError("จำนวนอุปกรณ์ที่ต้องการเบิกมีมากกว่าในสต๊อก", 400)
    );
  }
  const numHistory = await NumHistory.findById("626d011f9857ade448157c24");
  if (!numHistory)
    return next(new AppError("ไม่พบข้อมูลรหัสประวัติการใช้งาน", 404));
  // Adding or Requesting
  let newActionName = calculateLeftItem(action, "อุปกรณ์", givenTool, tool);
  await handleNotification(tool, "อุปกรณ์", tool.toolName);

  let newHistoryTool = new ToolHistory({
    code: `${numHistory.name}${numHistory.countNumber}`,
    tool: tool.id,
    creator: req.user.id,
    total: givenTool,
    action: newActionName,
    description: req.body.description,
    tags: [
      {
        creator: req.user.id,
        action: newActionName,
        total: givenTool,
        description: req.body.description,
      },
    ],
  });

  numHistory.countNumber += 1;

  await numHistory.save();
  await newHistoryTool.save();
  await tool.save();

  // *** Using socket.io for sending data ***
  // Do it here later

  sendResponse(tool, 200, res);
});

exports.restoreTool = catchAsync(async (req, res, next) => {
  const toolHistory = await ToolHistory.findById(req.params.thid);
  if (!toolHistory)
    return next(new AppError("ไม่พบประวัติรายการอุปกรณ์นี้", 404));
  if (toolHistory.action.startsWith("ยกเลิก")) {
    return next(new AppError("ข้อมูลนี้ไม่สามารถดำเนินการได้", 400));
  }
  const tool = await Tool.findById(toolHistory.tool);
  if (!tool) return next(new AppError("ไม่พบรายการอุปกรณ์นี้", 404));
  let action = definedAction(toolHistory.action);
  if (toolHistory.total > tool.total && action === "add") {
    return next(
      new AppError(
        `จำนวนอุปกรณ์ที่ต้องการขอคืนมีมากกว่าในสต๊อก ${toolHistory.total}:${tool.total}`,
        400
      )
    );
  }
  let newActionName = calculateAndRestoreItem(
    action,
    "อุปกรณ์",
    toolHistory.total,
    tool
  );
  await handleNotification(tool, "อุปกรณ์", tool.toolName);

  let newTag = {
    creator: req.user.id,
    action: newActionName,
    total: toolHistory.total,
    description: req.body.description,
  };
  toolHistory.action = newActionName;
  toolHistory.description = req.body.description;
  toolHistory.tags.push(newTag);

  await toolHistory.save();
  await tool.save();

  // *** Using socket.io for sending tool data ***
  // Do it here later

  sendResponse(tool, 200, res);
});

exports.deleteTool = catchAsync(async (req, res, next) => {
  const tool = await Tool.findById(req.params.tid);
  if (!tool) return next(new AppError("ไม่อุปกรณ์นี้", 404));

  if (hasImage(tool?.avatar)) {
    await deleteOneImage(tool.avatar?.public_id, null);
  }
  await deleteAllImage(tool.images);
  await tool.remove();

  // *** Using socket.io for sending tool data ***
  // Do it here later

  sendResponse(null, 204, res);
});
