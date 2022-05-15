const mongoose = require("mongoose");

const boardHistorySchema = new mongoose.Schema({
  code: { type: String, required: [true, "Please defined historycode"] },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please defined a board"],
    ref: "Board",
  },
  insufficientToolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InsufficientTool",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "This must have a creator"],
    ref: "User",
  },
  total: {
    type: Number,
    max: 1000000,
    required: [true, "Please fill board total"],
  },
  action: { type: String, required: [true, "Please fill action"] },
  createAt: { type: Date, required: true, default: Date.now },
  exp: {
    type: Date,
    required: true,
    default: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180)),
  },
  description: String,
  tags: [
    {
      creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "This must have a creator"],
        ref: "User",
      },
      action: { type: String, required: [true, "Please defined action tag"] },
      total: {
        type: Number,
        required: [true, "Please defined board total in this tag"],
      },
      createAt: { type: Date, required: true, default: Date.now },
      description: String,
      tools: [
        {
          total: { type: Number, default: 0 },
          insufficientTotal: { type: Number, default: 0 },
          tool: { type: mongoose.Schema.Types.ObjectId, ref: "Tool" },
          th: { type: mongoose.Schema.Types.ObjectId, ref: "ToolHistory" }
        },
      ],
    },
  ],
},{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

boardHistorySchema.pre(/^find/, function (next) {
  this.populate({ path: "creator", select: "name role" });
  this.populate({ path: "board", select: "boardName boardCode" });
  this.populate({ path: "tags.creator", select: "name role" });
  this.populate({ path: "tags.tools.tool", select: "toolName" });
  this.sort("-createAt");
  next();
});

const BoardHistory = mongoose.model("BoardHistory", boardHistorySchema);
module.exports = BoardHistory;
