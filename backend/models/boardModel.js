const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  boardName: { type: String, required: [true, "Please fill boardName."] },
  boardCode: { type: String, unique: true },
  total: { type: Number, max: 1000000, default: 0 },
  type: String,
  limit: { type: Number, max: 100000, default: 0 },
  avatar: { url: { type: String }, public_id: { type: String } },
  images: [{ url: { type: String }, public_id: { type: String } }],
  description: { type: String },
  isAlert: { type: Boolean, default: false },
  tools: [
    {
      total: { type: Number, default: 0 },
      detail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
        required: [true, "This must have tool data"],
      },
      type: { type: mongoose.Schema.Types.ObjectId, ref: "Tts" },
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Tcs" },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "This board must have a creator"],
    select: false
  },
});

boardSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tools.detail",
    select: "toolName toolCode size avatar",
  });
  this.populate({ path: "tools.type", select: "name" });
  this.populate({ path: "tools.category", select: "name" });
  next();
});

const Board = mongoose.model("Board", boardSchema);
module.exports = Board;
