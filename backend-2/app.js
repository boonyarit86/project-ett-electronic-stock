const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
// const hpp = require("hpp");
const http = require("http");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const socketIo = require("socket.io");
const xss = require("xss-clean");
const app = express();
const mongoose = require("mongoose");
const server = http.createServer(app);
dotenv.config({ path: "./config.env" });

// Utils
const AppError = require("./utils/appError");
const handleError = require("./middlewares/handleErrors");

// MongoDB
mongoose.connect(process.env.DATABASE_URL).then((con) => {
  console.log("Database is connecting...");
});

// Socket.io or Real-time Database
const io = socketIo(server, {
  transports: ["polling"],
  cors: {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  },
});

io.on("connection", (socket) => {
  console.log("Socket.io is connecting...");

  socket.on("disconnect", () => {
    console.log("Socket.io disconnected...");
  });
});

exports.io = io

// Set security HTTP headers
app.use(helmet());

// Log an action of using routes
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cors());

// Limit requests from API
const limiter = rateLimit({
  max: 1000, // 1000 times
  windowMs: 60 * 60 * 1000, // 1h
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

// *** If not import here, To export io module will fail. ***
// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Page 404
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Handle all global errors
app.use(handleError);

// Show some error about variable
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  process.exit(1);
});

// Server
const port = process.env.PORT || 5000;
const handleServer = server.listen(port, (err) => {
  if (err) console.log("Cannot connect server.");
  console.log(`Server is connecting on port ${port}`);
});

// When Async or Promise function does not have catch()
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  handleServer.close(() => {
    process.exit(1);
  });
});


