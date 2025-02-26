const bcrypt = require("bcrypt");
const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");

// Register User
const register = async (req, res) => {
  const { name, email, password, userRole } = req.body;

  if (!name.trim() || !email.trim() || !password.trim()) {
    return res
      .status(201)
      .json({ success: false, message: "Please fill all the fields" });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists, Please try with different email",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      userRole,
    });

    return res.status(200).json({
      success: true,
      data: newUser,
      message: "User Registered Successfull",
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

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email.trim() || !password.trim()) {
    return res
      .status(201)
      .json({ success: false, message: "Please fill all the fields" });
  }

  try {
    const userExists = await User.findOne({ email: email });

    if (!userExists) {
      return res.status(404).json({
        success: true,
        message: "User Does not Exists, Please try again",
      });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "Invalid Credentials, Please try again",
      });
    }

    const payload = {
      userId: userExists._id,
      email: userExists.email,
      userRole: userExists.userRole,
    };

    const secret = process.env.SECRET;
    // Short-lived Access Token
    const accessToken = jwt.sign(payload, secret, { expiresIn: "15m" });

    // Long-lived Refresh Token
    const refreshToken = jwt.sign(payload, secret, { expiresIn: "7d" });

    // const token = jwt.sign(payload, secret, { expiresIn: "5h" });

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "None", // or 'Strict' or 'None' depending on your needs
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
      })
      .json({
        success: true,
        data: userExists,
        accessToken,
        message: "User Logged In Successfully",
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

// Logout User
const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        path: "/",
      })
      .json({
        success: true,
        message: "Logout Successfully",
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

module.exports = { register, login, logout };
