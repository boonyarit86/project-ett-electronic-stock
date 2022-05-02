const AppError = require("../utils/appError");

// Invalid different id
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// In case of data having the same value or index
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// From Mongo Schema
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// From JWT when Token is incorrect.
const handleJWTError = () => {
  const message = `Invalid token. Please log in again!`;
  return new AppError(message, 401);
};

// From JWT when Token is expired
const handleJWTExpiredError = () => {
  const message = "Your token has expired! Please log in again.";
  return new AppError(message, 401);
};

// From Multer, when user uploads images too many,
const handleMulterError = (err) => {
  let message;
  message = `Invalid input data. Input นี้กำจัดการอัพโหลดไม่เกิน 3 รูปภาพ`;
  if (err.field === "avatar" || err.field === "newAvatar") {
    message = `Invalid input data. Input นี้กำจัดการอัพโหลดเพียงแค่ 1 รูปภาพ`;
  }
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // console.log(err.isOperational);
  // console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // In case of unknown error
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  // Working catching some errors on app.js
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
    // } else {
  } else if (process.env.NODE_ENV === "production") {
    // --- Some bug ---
    // error.name = undefined
    // err.name = some String
    let error = { ...err };
    if (err.name === "CastError") error = handleCastErrorDB(error);
    // // In case of data having the same value or index
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    // Error from Mongo Schema
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    // Error from JWT, when Token is incorrect.
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    // Error from JWT, When Token is expired.
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    // Error from Multer
    if (err.name === "MulterError") error = handleMulterError(error);

    if (!error.message && err.message) error.message = err.message;
    sendErrorProd(error, res);
  }
};
