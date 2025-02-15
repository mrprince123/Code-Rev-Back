const express = require("express");
const {
  updateUserById,
  deleteUserById,
  getUserById,
  getAllUsers,
} = require("../Controller/UserController");
const verifyToken = require("../Middleware/sendToken");
const router = express.Router();

router.get("/all",  getAllUsers);
router.get("/get", verifyToken, getUserById);
router.delete("/delete", verifyToken, deleteUserById);
router.put("/update", verifyToken, updateUserById);

module.exports = router;
