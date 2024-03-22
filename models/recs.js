const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recSchema = new mongoose.Schema({
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
      createdAt: {
        type: Date,
        default: Date.now,
      },
      tags : [
        {
            type: String
        }
      ]
})

const RecEntry = mongoose.model("rec", recSchema);

module.exports = { RecEntry };