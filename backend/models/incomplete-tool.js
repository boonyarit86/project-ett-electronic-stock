const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const incompleteToolSchema = new Schema({
    board: { type: Schema.Types.ObjectId, required: true, ref: "Board" },
    hisb: { type: Schema.Types.ObjectId, required: true, ref: "BoardHistory" },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    tools: [{
        tool: {type: Schema.Types.ObjectId, ref: "Tool"},
        hist: {type: Schema.Types.ObjectId, ref: "ToolHistory"},
        total: { type: Number },
        insuffTotal: { type: Number }
    }],
});

module.exports = mongoose.model('InsuffTool', incompleteToolSchema);