const mongoose = require("mongoose");

const ttsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please fill name."],
    unique: true,
    lowercase: true,
  },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

// Middleware 1
// Virtual populate
ttsSchema.virtual("categories", {
  ref: "Tcs",
  foreignField: "tts",
  localField: "_id",
});

// Middleware 2
ttsSchema.pre(/^find/, function(next) {
    this.populate({path: "categories", select: "-__v"});
    next();
})

const Tts = mongoose.model("Tts", ttsSchema);
module.exports = Tts;
