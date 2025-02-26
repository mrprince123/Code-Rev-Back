const express = require("express");
const verifyToken = require("../Middleware/sendToken");
const {
  createFeedback,
  getallFeedback,
  getSpecificFeedback,
  replyToFeedback,
  deleteFeedback,
} = require("../Controller/FeedbackController");
const adminAuth = require("../Middleware/adminAuth");
const router = express.Router();

router.post("/create", verifyToken, createFeedback);
router.get("/get/all", verifyToken, adminAuth, getallFeedback);
router.get("/get/specific", verifyToken, adminAuth, getSpecificFeedback);
router.put("/reply/:feedbackId", verifyToken, adminAuth, replyToFeedback);
router.delete("/delete/:feedbackId", verifyToken, adminAuth, deleteFeedback);

module.exports = router;
