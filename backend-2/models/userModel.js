const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { default: isEmail } = require("validator/lib/isEmail");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "กรุณากรอกอีเมล์"],
    lowercase: true,
    validate: [isEmail, "รูปแบบอีเมล์ไม่ถูกต้อง"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "กรุณากรอกชื่อ"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "โปรดกรอกรหัสผ่าน"],
    minlength: 4,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "โปรดยืนยันรหัสผ่าน"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "รหัสผ่านไม่ตรงกัน",
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  unreadNotification: {type: Number, default: 0}
});

// For routes: post(register), patch(/)
// Middleware 1
userSchema.pre("save", async function (next) {
  if(this.isNew || this.isModified("password")) {
    // console.log("New data or Data edited")
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
