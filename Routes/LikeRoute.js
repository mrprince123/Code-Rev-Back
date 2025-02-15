const express = require("express");
const {
  likeCode,
  unlikeCode,
  getAllLikesOnCode,
} = require("../Controller/LikeController");
const verifyToken = require("../Middleware/sendToken");

const router = express.Router();

router.post("/add/:submissionId", verifyToken, likeCode);
router.delete("/remove/:submissionId", verifyToken, unlikeCode);
router.get("/get/all/:submissionId", verifyToken, getAllLikesOnCode);
module.exports = router;
