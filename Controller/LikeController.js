const Likes = require("../Model/likeModel");
const Code = require("../Model/codeModel");

// Add a Like to Code
const likeCode = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { userId } = req.user;

    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Access Denied, Please login",
      });
    }

    // Check if the user has already liked the submission
    const existingLike = await Likes.findOne({ submissionId, userId });
    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this code.",
      });
    }

    const newLike = await Likes.create({
      submissionId,
      userId,
    });

    await Code.findByIdAndUpdate(submissionId, {
      $push: { likes: newLike._id },
    });

    return res.status(200).json({
      success: true,
      data: newLike,
      message: "Added new like on Code Successfully",
    });
  } catch (error) {
    console.log("Server error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Remove a Like from Code
const unlikeCode = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Access Denied, Please login",
      });
    }

    // Check if the like exists
    const like = await Likes.findOne({ submissionId, userId });
    if (!like) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    await Likes.deleteOne({ _id: like._id });

    // Remove like reference from the Code model
    await Code.findByIdAndUpdate(submissionId, {
      $pull: { likes: like._id },
    });

    return res.status(200).json({
      success: true,
      message: "Unlike Code Successfully",
    });
  } catch (error) {
    console.log("Server error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all the Likes on a Code
const getAllLikesOnCode = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const likes = await Likes.find({ submissionId }).populate(
      "userId",
      "name email"
    );

    return res.status(200).json({
      success: true,
      count: likes.length,
      data: likes,
      message: "All Likes on Code Fetched Successfully",
    });
  } catch (error) {
    console.log("Server error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { likeCode, unlikeCode, getAllLikesOnCode };
