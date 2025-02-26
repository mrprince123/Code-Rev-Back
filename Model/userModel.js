const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      requried: false,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: false,
      default:
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    },
    role: {
      type: String,
      required: false,
    },
    userRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    about: {
      type: String,
      required: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    socialLinks: [
      {
        type: String,
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
