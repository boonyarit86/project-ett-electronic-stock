const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({ path: "./config.env" });

// Show some error about variable
process.on("uncaughtException", (err) => {
  console.error(err.name, err.message);
  process.exit(1);
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

mongoose.connect(process.env.DATABASE_URL).then((con) => {
  console.log("Database is connecting...");
});

const port = process.env.PORT || 5000;
const server = app.listen(port, (err) => {
  if (err) console.log("Cannot connect server.");
  console.log(`Server is connecting on port ${port}`);
});

// When Async or Promise function does not have catch()
process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
})
