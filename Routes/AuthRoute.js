const express = require("express");
const { register, login, logout } = require("../Controller/AuthController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;