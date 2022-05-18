const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Tts = require("../models/ttsModel");
const Tcs = require("../models/tcsModel");

// UTILITIES
const sendResponse = (tts, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    data: {
      tts,
    },
  });
};

exports.getAll = catchAsync(async (req, res, next) => {
  // There are middleware 1 and 2 applying for populate() and virsual populate
  const tts = await Tts.find();
  res.status(200).json({
    status: "success",
    results: tts.length,
    data: {
      tts,
    },
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  const tts = await Tts.create(req.body);
  sendResponse(tts, 201, res);
});

exports.editOne = catchAsync(async (req, res, next) => {
  const tts = await Tts.findByIdAndUpdate(req.params.ttsId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tts) return next(new AppError("ไม่พบข้อมูลนี้", 404));
  sendResponse(tts, 200, res);
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  // There are middleware 1 and 2 applying for populate() and virsual populate
  const tts = await Tts.findById(req.params.ttsId);
  if (!tts) return next(new AppError("ไม่พบข้อมูลนี้", 404));
  
  // Delete all of Tcs data
  await Promise.all(
    tts.categories.map(async (res) => {
      await Tcs.findByIdAndDelete(res.id);
    })
  );

  await tts.remove();
  sendResponse(null, 204, res);
});
