const express = require("express");
const { register, login, logout, googleLogin } = require("../Controller/AuthController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/logout", logout);

module.exports = router;