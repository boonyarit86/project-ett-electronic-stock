const app = require("./app");
const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const morgan = require("morgan");
const mongoose = require("mongoose");
const server = http.createServer(express());
const socketIo = require("socket.io");
dotenv.config({ path: "./config.env" });

// Show some error about variable
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  process.exit(1);
});

// Log an action of using routes
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


// MongoDB
mongoose.connect(process.env.DATABASE_URL).then((con) => {
  console.log("Database is connecting...");
});

// Socket.io or Real-time Database
const io = socketIo(server, {
  transports: ["polling"],
  cors: {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  }
});

io.on("connection", (socket) => {
  console.log("Socket.io is connecting...");

  socket.on("disconnect", () => {
    console.log("Socket.io disconnected...");
  })
});

module.exports = io;

// Server
const port = process.env.PORT || 5000;
const handleServer = server.listen(port, (err) => {
  if (err) console.log("Cannot connect server.");
  console.log(`Server is connecting on port ${port}`);
});

// When Async or Promise function does not have catch()
process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    handleServer.close(() => {
        process.exit(1);
    })
})
