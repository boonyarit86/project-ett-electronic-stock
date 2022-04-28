const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
// const { io } = require("../app");
// console.log(io);

// --- Warning --- //
// Every function in catchAsync() must define async(). otherwise there are some waring message about headers. 

exports.register = catchAsync((req, res, next) => {
    console.log(req.body);

    res.status(200).json({
        // status: "success",
        data: {
            user: req.body
        }
    });
});
