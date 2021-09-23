const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cntSchema = new Schema({
    name: { type: String, required: true },
    cntNumber: { type: Number }
});

module.exports = mongoose.model('Count', cntSchema);