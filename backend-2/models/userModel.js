const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isEmail");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide your email"],
    lowercase: true,
    validate: [isEmail, "Please provide a valid email"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Please provide your name"],
    unique: true,
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
    enum: ["user", "staff", "unapprove", "admin"],
    default: "unapprove",
  },
  avatar: {
    url: String,
    public_id: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
});

// For routes: post(register), patch(/)
// Middleware 1
userSchema.pre("save", async function (next) {
  if(this.isNew || this.isModified("password")) {
    console.log("New data or Data edited")
    this.password = await bcrypt.hash(this.password, 12);
  }
  if(!this.isNew && this.isModified("password")) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  this.passwordConfirm = undefined;
  next();
});

// Middleware 2
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
