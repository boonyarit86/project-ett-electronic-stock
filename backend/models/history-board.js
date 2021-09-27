const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const boardHistorySchema = new Schema({
//     code: { type: String, required: true },
//     tid: { type: Array },
//     bid: {type: String, required: true},
//     incompleteToolid: {type: String},
//     boardName: { type: String, required: true },
//     boardCode: { type: String },
//     date: { type: String, required: true },
//     total: { type: Number, minlength: 7, required: true },
//     username: { type: String, required: true },
//     status: { type: String, required: true },
//     actionType: { type: String, required: true },
//     exp: { type: String, required: true,  },
//     description: { type: String },
//     actionEdit: { type: Array, required: true },
//     tools: { type: Array },
//     isDeleted: {type: Boolean, default: false}

// });

const boardHistorySchema = new Schema({
    code: { type: String, required: true },
    board: { type: Schema.Types.ObjectId, required: true, ref: "Board" },
    insuffiToolId: { type: Schema.Types.ObjectId, ref: "InsuffiTool" },
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    total: { type: Number, minlength: 7, required: true },
    actionType: { type: String, required: true },
    date: { type: String, required: true },
    exp: { type: String, required: true,  },
    description: { type: String },
    tags: [{
        user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        code: { type: String, required: true },
        action: { type: String, required: true },
        date: { type: String, required: true },
        total: { type: Number, minlength: 7, required: true },
        description: { type: String },
        tools: [{
            tool: {type: Schema.Types.ObjectId, ref: "Tool"},
            hist: {type: Schema.Types.ObjectId, ref: "ToolHistory"},
            total: { type: Number },
            insuffiTotal: { type: Number }
        }],
    }]
})

module.exports = mongoose.model('BoardHistory', boardHistorySchema);
