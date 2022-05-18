const mongoose = require("mongoose");

const numHistorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please fill name."],
    unique: true,
    uppercase: true
  },
  countNumber: {
    type: Number,
    required: [true, "Please fill number."],
  },
});

const numHistory = mongoose.model("NumHistory", numHistorySchema);
module.exports = numHistory;