const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const codeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
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
          "web-development",
          "mobile-development",
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
          "recursion",
          "dynamic-programming",
          "greedy",
          "graph-theory",
          "bit-manipulation",
          "string-manipulation",
          "mathematics",
          "regex",
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
    aiResponse: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to generate slug before saving
codeSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;
