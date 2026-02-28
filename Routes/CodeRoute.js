const express = require("express");
const {
  createCode,
  getAllCodes,
  updateCodeById,
  deleteCodeById,
  getCodeById,
  getAllPublicCodes,
  getPublicCodeById,
  reReviewCode,
} = require("../Controller/CodeController");
const verifyToken = require("../Middleware/sendToken");

const router = express.Router();

router.post("/create", verifyToken, createCode);
router.get("/all", verifyToken, getAllCodes);
router.get("/get/public/:slug", getPublicCodeById);
router.get("/get/:slug", verifyToken, getCodeById);
router.put("/update/:slug", verifyToken, updateCodeById);
router.delete("/delete/:slug", verifyToken, deleteCodeById);
router.get("/all/public", getAllPublicCodes);
router.patch("/re-review/:slug", verifyToken, reReviewCode);
module.exports = router;
