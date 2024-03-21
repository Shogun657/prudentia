const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
});
const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
