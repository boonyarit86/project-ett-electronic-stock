const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const boardHistorySchema = new Schema({
    code: { type: String, required: true },
    tid: { type: Array },
    bid: {type: String, required: true},
    incompleteToolid: {type: String},
    boardName: { type: String, required: true },
    boardCode: { type: String },
    date: { type: String, required: true },
    total: { type: Number, minlength: 7, required: true },
    username: { type: String, required: true },
    status: { type: String, required: true },
    actionType: { type: String, required: true },
    exp: { type: String, required: true,  },
    description: { type: String },
    actionEdit: { type: Array, required: true },
    tools: { type: Array },
    isDeleted: {type: Boolean, default: false}

});

boardHistorySchema.plugin(uniqueValidator);

module.exports = mongoose.model('BoardHistory', boardHistorySchema);
