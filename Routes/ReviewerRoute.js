const express = require("express");
const {
  getAllReviewForCode,
  submitReview,
  updateCodeReview,
  deleteCodeReview,
  getAllReviewUserCode,
} = require("../Controller/ReviewerController");
const verifyToken = require("../Middleware/sendToken");

const router = express.Router();

router.post("/submit/:codeId", verifyToken, submitReview);
router.get("/all/:codeId", verifyToken, getAllReviewForCode);
router.get("/all", verifyToken, getAllReviewUserCode);
router.put("/update/:reviewId", verifyToken, updateCodeReview);
router.delete("/delete/:reviewId", verifyToken, deleteCodeReview);

module.exports = router;
