const mongoose = require("mongoose");

const codeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: false,
    },
    tags: [
      {
        type: String,
        enum: ["bugfix", "sorting", "algorithm", "optimization"],
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Like",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Reviewer",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;
