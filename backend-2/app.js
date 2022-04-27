const express = require("express");
const helmet = require("helmet");
// const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const app = express();

// Routes

// Utils
const AppError = require("./utils/appError");
const handleError = require("./middlewares/handleErrors");

// Set security HTTP headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Limit requests from API
const limiter = rateLimit({
  max: 1000, // 1000 times
  windowMs: 60 * 60 * 1000, // 1h
  message:'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter);

// Data sanitization against NoSQL query injection *
// After use this, cannot use {"email": "{"$gt": ""}", "password": "1234"} for login system or query data
app.use(mongoSanitize());

// Data sanitization against XSS *
// Such as {"yourName": "<p>Boonyarit</p>"} => {"yourName": "*/p>Boonyarit</p/*c"}
app.use(xss());

// Prevent parameter pollution
// app.use(hpp( { whitelist: 'duration' } ));
// app.use(
//   hpp({
//     whitelist: ['duration']
//   })
// );

// Routes
// app.use("/api", path)

// Page 404
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Handle all global errors
app.use(handleError);

module.exports = app;
