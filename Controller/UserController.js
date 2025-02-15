const Code = require("../Model/codeModel");
const Likes = require("../Model/likeModel");
const Reviewer = require("../Model/reviewModel");
const User = require("../Model/userModel");

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
      success: false,
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

// Update User By Id
const updateUserById = async (req, res) => {
  try {
    const { userId } = req.user;
    const updateUser = req.body;

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
