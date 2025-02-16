const multer = require("multer");
const Code = require("../Model/codeModel");
const Likes = require("../Model/likeModel");
const Reviewer = require("../Model/reviewModel");
const User = require("../Model/userModel");
const path = require("path");
const util = require("util");

// Configure Multer (for file Upload)
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.filename + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Get all Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    if (!users) {
      return res.status(404).json({
        success: true,
        message: "User not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users Fetched Successfully",
      data: users,
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get User By Id
const getUserById = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found with Provided Id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Fetched Successfully",
      data: user,
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const uploadSingle = util.promisify(upload.single("profilePicture"));

// Update User By Id
const updateUserById = async (req, res) => {
  try {
    await uploadSingle(req, res);

    const { userId } = req.user;
    let updateUser = { ...req.body };

    // Prevent updating restricted fields
    const restrictedFields = ["_id", "password"];
    restrictedFields.forEach((field) => delete updateUser[field]);

    // If an image was uploaded, update the profileImage field
    if (req.file) {
      updateUser.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateUser,
      { new: true } // Only return necessary fields
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: "User Profile Updated Successfully",
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete User By Id
const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found with Provided Id",
      });
    }

    // Delete all codes created by the user
    await Code.deleteMany({ authorId: userId });

    // Delete all reviews written by the user
    await Reviewer.deleteMany({ reviewerId: userId });

    // Delete all likes given by the user
    await Likes.deleteMany({ userId: userId });

    // Now delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { getAllUsers, getUserById, updateUserById, deleteUserById };
