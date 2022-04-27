const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.testing = catchAsync((req, res, next) => {
    let err = false;
    if(err) return next(new AppError("Testing failed.", 400));

    res.status(200).json({
        message: "Successful testing"
    });
})