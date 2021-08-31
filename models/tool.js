const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const toolSchema = new Schema({
    toolName: { type: String, required: true },
    toolCode: { type: String },
    total: { type: Number, minlength: 7 },
    type: { type: String, required: true },
    category: { type: String },
    size: { type: String },
    limit: { type: Number, minlength: 7},
    imageProfile: { type: Object },
    images: { type: Array },
    status: { type: Boolean, required: true },
    description: { type: String },
    isAlert: {type: Boolean, default: false}
});

toolSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Tool', toolSchema);