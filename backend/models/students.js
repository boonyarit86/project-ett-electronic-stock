const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const studentSchema = new Schema({
    studentId: {type: String, required: true},
    fname: { type: String, required: true },
    lname: {type: String, required: true},
    studentFaculty: {type: Number, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
});

studentSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Students', studentSchema);