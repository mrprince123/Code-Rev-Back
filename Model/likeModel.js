const mongoose = require("mongoose");

const likeSchema = mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Code",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Likes = mongoose.model("Like", likeSchema);
module.exports = Likes;
