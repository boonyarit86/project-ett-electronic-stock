const mongoose = require("mongoose");

const insufficientToolSchema = new mongoose.Schema({
  bh: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please defined a board history id"],
    ref: "BoardHistory",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "This must have a creator"],
    ref: "User",
  },
  createAt: { type: Date, required: true, default: Date.now },
  tools: [
    {
      insufficientTotal: { type: Number },
      detail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
        required: [true, "This must have tool data"],
      },
      type: { type: mongoose.Schema.Types.ObjectId, ref: "Tts" },
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Tcs" },
      th: { type: mongoose.Schema.Types.ObjectId, ref: "ToolHistory" }
    },
  ],
});

insufficientToolSchema.pre(/^find/, function (next) {
    this.populate({ path: "bh", select: "code" });
    this.populate({ path: "bh.board", select: "boardName boardCode" });
    this.populate({ path: "creator", select: "name role avatar" });
    this.populate({
      path: "tools.detail",
      select: "toolName toolCode total",
    });
    this.populate({ path: "tools.type", select: "name" });
    this.populate({ path: "tools.category", select: "name" });
    next();
  });

const InsufficientTool = mongoose.model("InsufficientTool", insufficientToolSchema);
module.exports = InsufficientTool;
