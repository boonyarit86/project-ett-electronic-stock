const mongoose = require('mongoose');

const toolHistorySchema = new mongoose.Schema({
    code: {type: String, required: [true, "Please defined historycode"]},
    tool: {type: mongoose.Schema.Types.ObjectId, required: [true, "Please defined a tool"], ref: "Tool"},
    creator: { type: mongoose.Schema.Types.ObjectId, required: [true, "This must have a creator"], ref: "User" },
    total: { type: Number, max: 1000000, required: [true, "Please fill tool total"]},
    action: { type: String, required: [true, "Please fill actionType"] },
    createAt: { type: Date, required: true, default: Date.now },
    exp: { type: Date, required: true, default: new Date(new Date().getTime() + 1000 * 60 * (1440 * 180))},
    description: String,
    tags: [{
        creator: { type: mongoose.Schema.Types.ObjectId, required: [true, "This must have a creator"], ref: "User" },
        action: { type: String, required: [true, "Please defined action tag"] },
        total: { type: Number, required: [true, "Please defined tool total in this tag"]},
        createAt: { type: Date, required: true, default: Date.now },
        board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
        insuffTotal: Number,
        description: String
    }]
});

const ToolHistory = mongoose.model('ToolHistory', toolHistorySchema);
module.exports = ToolHistory;