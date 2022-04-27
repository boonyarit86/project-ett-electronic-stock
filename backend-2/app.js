const express = require("express");

const app = express();

// Routes

// Utils
const AppError = require("./utils/appError");
const handleError = require("./middlewares/handleErrors");

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Routes
// app.use("/api", path)

// Page 404
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Handle all global errors
app.use(handleError);

module.exports = app;
