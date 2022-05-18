const catchAsync = require("../utils/catchAsync");
const NumHistory = require("../models/numHistory");

// Only for first time or when starting using this project.
exports.createOne = catchAsync(async(req, res, next) => {
    // For ToolHistory
    let obj = { name: "HT", countNumber: 0 };
    // For BoardHistory
    // let obj = { name: "HB", countNumber: 0 };
    const data = NumHistory.create(obj);

    res.status(201).json({status: "success", data});
})