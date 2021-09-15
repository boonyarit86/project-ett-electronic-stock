const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    post: { type: String, required: true },
    image: { type: String, required: true },
    username: { type: String, require: true },
    status: { type: String, required: true },
    date: { type: String, required: true },
    exp: { type: String, required: true }
});

notificationSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Notification', notificationSchema);