const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema({
  toolName: { type: String, required: [true, "Please fill toolName."] },
  toolCode: { type: String, unique: true },
  total: { type: Number, max: 1000000, default: 0 },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tts",
    required: [true, "Please select tool type."],
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Tcs" },
  size: { type: String },
  limit: { type: Number, max: 100000, default: 0 },
  avatar: { url: { type: String }, public_id: { type: String } },
  images: [{ url: { type: String }, public_id: { type: String } }],
  description: { type: String },
  isAlert: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "This tool must have a creator"] },
});

const Tool = mongoose.model("Tool", toolSchema);
module.exports = Tool;
