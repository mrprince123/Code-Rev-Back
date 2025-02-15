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
        "https://giftolexia.com/wp-content/uploads/2015/11/dummy-profile.png",
    },
    role: {
      type: String,
      required: false,
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
