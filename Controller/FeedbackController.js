const FeedbackModel = require("../Model/feedbackModel");

// Create new Feedback
const createFeedback = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login and try again",
      });
    }

    const { purpose, message } = req.body;

    if (
      !purpose ||
      !message ||
      purpose.trim() === "" ||
      message.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // Create new Feedback and save
    const feedback = await FeedbackModel.create({
      userId,
      purpose,
      message,
    });

    return res.status(201).json({
      success: true,
      data: feedback,
      message: "Your Feedback was Sent Successfuly! You will get a reply soon.",
    });
  } catch (error) {
    console.log("Server Error Feedback ", error);
    return res.status(500).json({
      success: false,
      message: "Interna Server Error ",
      error: error.message,
    });
  }
};

// Get all Feedback
const getallFeedback = async (req, res) => {
  try {
    const allFeedbacks = await FeedbackModel.find({});

    if (allFeedbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Feedback Found!!",
      });
    }

    return res.status(200).json({
      success: true,
      data: allFeedbacks,
      message: "All Feedback fetched successfully!!",
    });
  } catch (error) {
    console.log("Server Error Feedback ", error);
    return res.status(500).json({
      success: false,
      message: "Interna Server Error ",
      error: error.message,
    });
  }
};

// Get Feedback of Specific User
const getSpecificFeedback = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const feedbacks = await FeedbackModel.find({ userId });

    if (!feedbacks || feedbacks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Feedback Found for this user!",
      });
    }

    return res.status(200).json({
      success: true,
      data: feedbacks,
      message: "User's feedback fetched successfully!",
    });
  } catch (error) {
    console.log("Server Error Feedback: ", error);
    return res.status(500).json({
      success: false,
      message: "Interna Server Error ",
      error : error.message,
    });
  }
};

// Give Reply or Update the Feedback by Admin
const replyToFeedback = async (req, res) => {
  try {
    // You need to be authenticated to give reply as admin
    const { userId } = req.user;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Login and try again",
      });
    }

    const { feedbackId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const feedback = await FeedbackModel.findByIdAndUpdate(
      feedbackId,
      { reply },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: feedback,
      message: "Feedback reply updated successfully!",
    });
  } catch (error) {
    console.log("Server Error Feedback ", error);
    return res.status(500).json({
      success: false,
      message: "Interna Server Error ",
      error: error.message,
    });
  }
};

// Delete the Specific Feedback
const deleteFeedback = async (req, res) => {
  try {
    // You need to be authenticated to give reply as admin
    const { userId } = req.user;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Login and try again",
      });
    }

    const { feedbackId } = req.params;

    const feedback = await FeedbackModel.findByIdAndDelete(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully!",
    });
  } catch (error) {
    console.error("Server Error Feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  getallFeedback,
  getSpecificFeedback,
  replyToFeedback,
  deleteFeedback,
};
