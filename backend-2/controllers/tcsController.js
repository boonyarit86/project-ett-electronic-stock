const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Tcs = require("../models/tcsModel");

// UTILITIES
const sendResponse = (tcs, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    data: {
      tcs,
    },
  });
};

exports.getAll = catchAsync(async (req, res, next) => {
  const tcs = await Tcs.find();
  res.status(200).json({
    status: "success",
    results: tcs.length,
    data: {
      tcs,
    },
  });
});

exports.createOne = catchAsync(async (req, res, next) => {
  const tcs = await Tcs.create(req.body);
  sendResponse(tcs, 201, res);
});

exports.editOne = catchAsync(async (req, res, next) => {
  const tcs = await Tcs.findByIdAndUpdate(req.params.tcsId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tcs) return next(new AppError("ไม่พบข้อมูลนี้", 404));
  sendResponse(tcs, 200, res);
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const tcs = await Tcs.findById(req.params.tcsId);
  if (!tcs) return next(new AppError("ไม่พบข้อมูลนี้", 404));
  await tcs.remove();
  sendResponse(tcs, 204, res);
});
