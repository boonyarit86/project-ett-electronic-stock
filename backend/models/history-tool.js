const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const toolHistorySchema = new Schema({
    code: { type: String, required: true },
    tid: {type: String, required: true},
    toolName: { type: String, required: true },
    boardName: { type: String },
    boardCode: { type: String },
    boardType: { type: String },
    category: { type: String },
    type: { type: String },
    size: { type: String },
    date: { type: String, required: true },
    total: { type: Number, minlength: 7, required: true },
    username: { type: String, required: true },
    status: { type: String, required: true },
    actionType: { type: String, required: true },
    exp: { type: String, required: true,  },
    description: { type: String },
    actionEdit: { type: Array, required: true },
    isDeleted: {type: Boolean, default: false}
});

toolHistorySchema.plugin(uniqueValidator);

module.exports = mongoose.model('ToolHistory', toolHistorySchema);