const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cntSchema = new Schema({
    name: { type: String, required: true },
    cntNumber: { type: Number }
});

cntSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Count', cntSchema);