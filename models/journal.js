const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
const imageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
});
imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
const opts = { toJSON: { virtuals: true } };

const journalEntrySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: [imageSchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);

module.exports = { JournalEntry };
