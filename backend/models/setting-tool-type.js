const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sttSchema = new Schema({
  type: { type: String, required: true },
  categorys: [{ category: { type: String } }]
});

module.exports = mongoose.model("Stt", sttSchema);
