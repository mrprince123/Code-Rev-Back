const express = require("express");
const {
  createCode,
  getAllCodes,
  updateCodeById,
  deleteCodeById,
  getCodeById,
  getAllPublicCodes,
  getPublicCodeById,
} = require("../Controller/CodeController");
const verifyToken = require("../Middleware/sendToken");

const router = express.Router();

router.post("/create", verifyToken, createCode);
router.get("/all", verifyToken, getAllCodes);
router.get("/get/public/:id", getPublicCodeById);
router.get("/get/:id", verifyToken, getCodeById);
router.put("/update/:id", verifyToken, updateCodeById);
router.delete("/delete/:id", verifyToken, deleteCodeById);
router.get("/all/public", getAllPublicCodes);
module.exports = router;
