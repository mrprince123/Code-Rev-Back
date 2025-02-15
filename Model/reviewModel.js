const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Code",
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reviewer = mongoose.model("Reviewer", reviewSchema);
module.exports = Reviewer;
