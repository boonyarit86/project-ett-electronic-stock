const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    post: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    isSysMsg: { type: Boolean, required: true, default: true },
    date: { type: Date, required: true, default: Date.now },
    // exp: { type: String, required: true, default: new Date(new Date().getTime() + 1000 * 60 * (1440 * 7)) }
});

module.exports = mongoose.model('Notification', notificationSchema);