const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const incompleteToolSchema = new Schema({
    bid: {type: String, required: true},
    boardName: { type: String, required: true },
    boardCode: { type: String },
    imageProfile: { type: String },
    date: { type: String, required: true },
    username: { type: String, required: true },
    status: { type: String, required: true },
    tools: { type: Array, required: true },
    actionType: { type: String },
});

incompleteToolSchema.plugin(uniqueValidator);

module.exports = mongoose.model('IncompleteTool', incompleteToolSchema);