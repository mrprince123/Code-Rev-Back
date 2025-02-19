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
      enum: [
        "JavaScript",
        "Python",
        "Java",
        "C",
        "C++",
        "PHP",
        "Go",
        "Rust",
        "SQL",
        "Markdown",
        "JSON",
        "XML",
        "HTML",
        "CSS",
      ],      
      required: false,
    },
    tags: [
      {
        type: String,
        enum: [
          "bugfix",
          "sorting",
          "algorithm",
          "optimization",
          "data-structure",
          "performance",
          "security",
          "best-practices",
          "API",
          "database",
          "authentication",
          "authorization",
          "machine-learning",
          "frontend",
          "backend",
          "fullstack",
          "UI/UX",
          "testing",
          "debugging",
          "deployment",
          "cloud",
          "DevOps",
          "web-scraping",
          "game-development",
          "AI",
          "blockchain",
          "networking",
        ],
        required: true,
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
    aiResponse : {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;