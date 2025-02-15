const Reviewer = require("../Model/reviewModel");
const Code = require("../Model/codeModel");

// Submit a Review
const submitReview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { codeId } = req.params;
    const { comment, rating } = req.body;

    if (!comment || !rating) {
      return res.status(400).json({
        success: false,
        message: "Comment and rating are required",
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Reviewer.findOne({
      submissionId: codeId,
      reviewerId: userId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this code.",
      });
    }

    const newReview = await Reviewer.create({
      submissionId: codeId,
      reviewerId: userId,
      comment,
      rating,
    });

    await Code.findByIdAndUpdate(codeId, {
      $push: { reviews: newReview._id },
    });

    return res.status(201).json({
      success: true,
      data: newReview,
      message: "New Review Added Successfully",
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Issue",
      error: error.message,
    });
  }
};

// Update Review
const updateCodeReview = async (req, res) => {
  try {
    // get the reviewer Id
    const { userId } = req.user;
    // get the Review Id
    const { reviewId } = req.params;
    const updateData = req.body;

    // find and update
    const review = await Reviewer.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.reviewerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this review",
      });
    }

    const updateReview = await Reviewer.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updateReview,
      message: "Review Updated Successfull",
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Issue",
      error: error.message,
    });
  }
};

// Delete Review
const deleteCodeReview = async (req, res) => {
  try {
    // get the reviewer Id
    const { userId } = req.user;
    // get the Review Id
    const { reviewId } = req.params;

    // find and update
    const review = await Reviewer.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.reviewerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this review",
      });
    }

    await Reviewer.findByIdAndDelete(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review Deleted Successfull",
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Issue",
      error: error.message,
    });
  }
};

// Get All Review of the Specific Codes
const getAllReviewForCode = async (req, res) => {
  try {
    const { codeId } = req.params;

    const reviewers = await Reviewer.find({ submissionId: codeId });

    if (!reviewers.length) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this code",
      });
    }

    return res.status(200).json({
      success: true,
      data: reviewers,
      message: "Fetched All Review Successfully",
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Issue",
      error: error.message,
    });
  }
};

// Get All Review of the Specific User
const getAllReviewUserCode = async (req, res) => {
  try {
    const { userId } = req.user;
    const reviews = await Reviewer.find({ reviewerId: userId }).populate({
      path: "submissionId",
      select: "title",
    });

    return res.status(200).json({
      success: true,
      data: reviews,
      message: "Fetched All Reviews of User Successfully",
    });
  } catch (error) {
    console.log("Server Error ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Issue",
      error: error.message,
    });
  }
};

module.exports = {
  submitReview,
  updateCodeReview,
  deleteCodeReview,
  getAllReviewForCode,
  getAllReviewUserCode,
};
