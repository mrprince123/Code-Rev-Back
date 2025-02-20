const express = require("express");
const {
  updateUserById,
  deleteUserById,
  getUserById,
  getAllUsers,
} = require("../Controller/UserController");
const verifyToken = require("../Middleware/sendToken");
const multer = require("multer");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/all", getAllUsers);
router.get("/get", verifyToken, getUserById);
router.delete("/delete", verifyToken, deleteUserById);
router.put(
  "/update",
  verifyToken,
  upload.single("profilePicture"),
  updateUserById
);

module.exports = router;
