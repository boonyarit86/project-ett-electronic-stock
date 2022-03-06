const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const catchError = require("./utils/catchError");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);

// app.post("/cnt", (req, res) => {
//   let newHistoryCnt = new HistoryCnt({
//       name: "HB",
//       cntNumber: 1
//   })

//   newHistoryCnt.save()
//   res.status(201).json(newHistoryCnt)
// })

mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mongo3-crud.7dsrv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log(`DB up and running`);
  }
);

// let frontend_url = "https://socket-beb.herokuapp.com";
let frontend_tempo = "http://localhost:3000";

const io = socketIO(server, {
  transports: ["polling"],
  cors: {
    cors: {
      origin: frontend_tempo,
    },
  },
});

io.on("connection", (socket) => {
  console.log(`A user: ${socket.id} is connected `);

  socket.on("disconnect", () => {
    console.log(`All socket ${socket.id} disconnected`);
  });
});

module.exports = io;
app.use(express.json());
app.use(cors());
// app.use(express.static(path.join("public")));

// app.use("/api/users", require("./routes/book-routers"));
app.use("/api/users", require("./routes/users-routes"));
app.use("/api/stts", require("./routes/stt-routes"));
app.use("/api/tools", require("./routes/tools-routes"));
app.use("/api/boards", require("./routes/boards-routes"));
app.use("/api/notifications", require("./routes/notifications-routes"));

// app.use((req, res, next) => {
//   res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
// })

app.all('*', (req, res, next) => {
  // res.status(404).send(`Can not find ${req.originalUrl} on this server!`);
  catchError(res, `Can not find ${req.originalUrl} on this server!`, 404);
  next();
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server up and running on port 5000`);
});
