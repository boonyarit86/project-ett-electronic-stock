const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const projectHistorySchema = new Schema({
    code: { type: String, required: true },
    tid: { type: Array },
    incompleteToolid: {type: String},
    projectName: { type: String, required: true },
    projectCode: { type: String },
    type: { type: String },
    companyName: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    date: { type: String, required: true },
    total: { type: Number, minlength: 7, required: true },
    imageProfile: { type: Object },
    images: { type: Array },
    username: { type: String, required: true },
    status: { type: String, required: true },
    actionType: { type: String, required: true },
    exp: { type: String, required: true,  },
    description: { type: String },
    actionEdit: { type: Array, required: true },
    tools: { type: Array }
});

projectHistorySchema.plugin(uniqueValidator);

module.exports = mongoose.model('projectHistory', projectHistorySchema);
