const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isEmail");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide your email"],
    lowercase: true,
    validate: [isEmail, "Please provide a valid email"],
  },
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 4,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  role: {
    type: String,
    enum: ['user', 'staff', 'unapprove', 'admin'],
    default: 'unapprove'
  },
  avartar: {
    url: String,
    publicId: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordChangedAt: Date
});
