const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    exp: { type: Date, required: true, default: new Date(new Date().getTime() + 1000 * 60 * (1440 * 7))}
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;