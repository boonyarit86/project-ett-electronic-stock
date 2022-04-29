const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { hasImage } = require("../utils/index");
const { deleteOneImage, uploadOneImage } = require("../utils/handleImage");
// const { io } = require("../app");
// console.log(io);

// --- Warning --- //
// Every function in catchAsync() must define async(). otherwise there are some waring message about headers.


// --- Utilities ---

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const sendResponse = (user, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};

const userHaveImage = (img) => {
  return hasImage(img?.url) && hasImage(img?.public_id);
};


// --- Controllers ---

exports.getAllusers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  // Before sending data, check if user's active not equals false in Middleware 2.
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) return next(new AppError("ไม่พบผู้ใช้งานนี้", 404));
  sendResponse(user, 200, res);
});

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  sendResponse(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("ไม่พบผู้ใช้งานนี้", 404));

  if (user.role === "unapprove") {
    return next(new AppError("กำลังรอการอนุมัติจาก Admin", 401));
  }

  // Use methods.correctPassword
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.editProfile = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, oldPassword, name, avatar } =
    req.body;
  const user = await User.findById(req.params.userId).select("+password");
  if (!user) return next(new AppError("ไม่พบผู้ใช้งานนี้", 404));
  await setPassword({ oldPassword, password, passwordConfirm }, user);

  // Check if image is deleted from user on frontend and there is image in DB
  if (!userHaveImage(avatar) && Boolean(user.avatar.public_id)) {
    await deleteOneImage(user.avatar.public_id, user);
  }
  // Check user uploads new image
  if (hasImage(req.file)) {
    await uploadOneImage(req.file.path, user);
  }

  user.email = email;
  user.name = name;

  // Before saving, there are some middleware functionalities working.
  await user.save();
  user.password = undefined;

  sendResponse(user, 200, res);

  async function setPassword({ oldPassword, password, passwordConfirm }, user) {
    if (oldPassword) {
      let validatePassword = await user.correctPassword(
        oldPassword,
        user.password
      );
      if (!validatePassword) {
        return next(new AppError("รหัสผ่านเก่าไม่ถูกต้อง", 401));
      }
      user.passwordConfirm = passwordConfirm;
      user.password = password;
    } else {
      user.passwordConfirm = user.password;
    }
  }
});

exports.setUserRole = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  const role = req.body?.role;
  if (!user) return next(new AppError("ไม่พบผู้ใช้งานนี้", 404));
  if (role !== "admin") user.role = role;
  await user.save({ validateBeforeSave: false });

  sendResponse(user, 200, res);
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select("+active");
  if (!user) return next(new AppError("ไม่พบผู้ใช้งานนี้", 404));

  if (userHaveImage(user?.avatar)) {
    await deleteOneImage(user?.avatar?.public_id, user);
  }
  user.active = false;
  await user.save({ validateBeforeSave: false });
  sendResponse(null, 204, res);
});