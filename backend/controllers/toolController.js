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
  hasFile,
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
const sendResponse = (tool, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    data: {
      tool,
    },
  });
};

const deleteExpireditem = async (data) => {
  let docs = [];
  if (data.length > 0) {
    data.forEach(async (item) => {
      let expHistory = new Date(item.exp).getTime();
      let currentDate = new Date().getTime();
      if (item.tool === null && expHistory < currentDate) {
        await ToolHistory.findByIdAndDelete(item.id);
        return;
      }
      docs.push(item);
    });
  }
  return docs;
};

const factoryData = (doc) => {
  if (doc.length > 0) {
    let newToolList = doc.map((tool) => {
      tool.type.categories = null;
      return tool;
    });
    doc = newToolList;
  }
  return doc;
};

const getUpdatedTool = async (id) => {
  const doc = await Tool.findById(id)
    .populate({ path: "type", select: "name" })
    .populate({ path: "category", select: "name" });
  doc.type.categories = null;
  return doc;
};

const getUpdatedToolHistory = async (id) => {
  const doc = await ToolHistory.findById(id)
  .populate({ path: "creator", select: "name role" })
  .populate({path: "tool", select: "toolName"})
  .populate({path: "tags.creator", select: "name role"})
  .populate({path: "tags.board", select: "boardName"})
  return doc;
};

exports.getAllTools = catchAsync(async (req, res, next) => {
  const tools = await Tool.find().populate("type category");
  let docs = factoryData(tools);

  res.status(200).json({
    status: "success",
    results: tools.length,
    data: {
      tools: docs,
    },
  });
});

exports.getAllToolHistory = catchAsync(async (req, res, next) => {
  const toolHistories = await ToolHistory.find();
  const docs = await deleteExpireditem(toolHistories);

  res.status(200).json({
    status: "success",
    results: docs.length,
    data: {
      toolHistories: docs,
    },
  });
});

exports.getTool = catchAsync(async (req, res, next) => {
  const tool = await Tool.findById(req.params.tid)
    .populate({ path: "type", select: "name" })
    .populate({ path: "category", select: "name" });
  if (!tool) return next(new AppError("ไม่พบรายการอุปกรณ์นี้", 404));
  tool.type.categories = null;
  sendResponse(tool, 200, res);
});

exports.createTool = catchAsync(async (req, res, next) => {
  const tool = new Tool(req.body);
  tool.creator = req.user._id;
  await tool.save();
  if (hasFile(req.file)) {
    await uploadOneImage(req.file.path, tool);
    await tool.save({ validateBeforeSave: false });
  }

  let docUpdated = await getUpdatedTool(tool._id);

  io.emit("tool-adding", docUpdated);
  sendResponse(tool, 201, res);
});

exports.editTool = catchAsync(async (req, res, next) => {
  const { toolName, toolCode, type, category, limit, size, description } =
    req.body;
  const newAvatar = Boolean(req.files?.newAvatar) ? req.files.newAvatar[0] : {};
  const newImages = Boolean(req.files?.newImages) ? req.files.newImages : [];
  const avatar = req.body?.avatar ? JSON.parse(req.body.avatar) : null;
  const imagesDeleted = req.body?.imagesDeleted
    ? JSON.parse(req.body.imagesDeleted)
    : [];

  // Resolve this array to be req.body.imagesDeleted later.
  // const imagesDeleted = [
  // { public_id: "mhotn5zxyglw3a3t5tqs" },
  // { public_id: "lra3v2ap88tpqz7ebldx" },
  // ];

  const tool = await Tool.findById(req.params.tid);
  if (!tool) return next(new AppError("ไม่พบรายการอุปกรณ์นี้", 404));

  tool.toolName = toolName;
  tool.toolCode = toolCode;
  tool.type = type;
  tool.category = category ? category : tool.category;
  tool.limit = limit;
  tool.size = size;
  tool.description = description;
  await tool.save();

  await handleOneImage(tool, newAvatar, avatar);
  await tool.save({ validateBeforeSave: false });
  await handleManyImages(tool, newImages, imagesDeleted);
  await tool.save({ validateBeforeSave: false });

  let docUpdated = await getUpdatedTool(tool._id);

  io.emit("tool-updating", docUpdated);
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

  io.emit("tool-action", { tid: tool._id, total: tool.total });

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

  let docUpdated = await getUpdatedToolHistory(req.params.thid);
  io.emit("tool-action", { tid: tool._id, total: tool.total });

  res.status(200).json({
    status: "success",
    data: {
      doc: docUpdated
    },
  });
});

exports.deleteTool = catchAsync(async (req, res, next) => {
  const tool = await Tool.findById(req.params.tid);
  if (!tool) return next(new AppError("ไม่มีอุปกรณ์นี้", 404));

  if (hasImage(tool?.avatar)) {
    await deleteOneImage(tool.avatar?.public_id, null);
  }
  await deleteAllImage(tool.images);
  await tool.remove();

  io.emit("tool-deleting", { tid: tool._id });

  sendResponse(null, 204, res);
});
