const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avartar: {
    url: { type: String },
    public_id: { type: String },
  },
  status: {
    type: String,
    enum: ["none", "user", "staff", "admin"],
    default: "none",
    required: true,
  },
  unreadNotification: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);
