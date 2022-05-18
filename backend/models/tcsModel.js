const mongoose = require("mongoose");

const tcsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please fill name."],
    unique: true,
    lowercase: true,
  },
  tts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tts",
    required: [true, "Please select Tts id"],
  },
});

const Tcs = mongoose.model("Tcs", tcsSchema);
module.exports = Tcs;
