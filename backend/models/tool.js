const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const toolSchema = new Schema({
    toolName: { type: String, required: true },
    toolCode: { type: String, unique: true },
    total: { type: Number, minlength: 7 },
    type: { type: String, ref: "Stt", required: true },
    category: { type: String },
    size: { type: String },
    limit: { type: Number, minlength: 7},
    avartar: { url: {type: String}, public_id: {type: String} },
    images: [{ url: {type: String}, public_id: {type: String} }],
    description: { type: String },
    isAlert: {type: Boolean, default: false}
});

module.exports = mongoose.model('Tool', toolSchema);