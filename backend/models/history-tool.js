const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// const toolHistorySchema = new Schema({
//     code: { type: String, required: true },
//     tid: {type: String, required: true},
//     toolName: { type: String, required: true },
//     boardName: { type: String },
//     boardCode: { type: String },
//     boardType: { type: String },
//     category: { type: String },
//     type: { type: String },
//     size: { type: String },
//     date: { type: String, required: true },
//     total: { type: Number, minlength: 7, required: true },
//     username: { type: String, required: true },
//     status: { type: String, required: true },
//     actionType: { type: String, required: true },
//     exp: { type: String, required: true,  },
//     description: { type: String },
//     actionEdit: { type: Array, required: true },
//     isDeleted: {type: Boolean, default: false}
// });

const toolHistorySchema = new Schema({
    code: { type: String, required: true },
    tool: {type: Schema.Types.ObjectId, required: true, ref: "Tool"},
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
        total: { type: Number, required: true },
        date: { type: String, required: true },
        boardName: { type: String },
        insuffiTotal: { type: String },
        description: { type: String }
    }]
});


module.exports = mongoose.model('ToolHistory', toolHistorySchema);