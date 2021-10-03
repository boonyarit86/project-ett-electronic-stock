const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    post: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    isSysMsg: { type: Boolean, required: true, default: true },
    date: { type: String, required: true, default: new Date() },
    exp: { type: String, required: true }
});

module.exports = mongoose.model('Notification', notificationSchema);