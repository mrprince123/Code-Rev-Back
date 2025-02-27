const bcrypt = require("bcrypt");
const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// Login with google
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // If user does not exists, create a new one
      user = await User.create({
        name,
        email,
        password: email,
        userRole: "user",
        profilePicture: picture,
      });
    }

    // Generate JWT Token
    const jwtPayload = {
      userId: user._id,
      email: user.email,
      userRole: user.userRole,
    };

    const secret = process.env.SECRET;
    const accessToken = jwt.sign(jwtPayload, secret, { expiresIn: "15m" });
    const refreshToken = jwt.sign(jwtPayload, secret, { expiresIn: "7d" });

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
      })
      .json({
        success: true,
        data: user,
        accessToken,
        message: "Google Login Successful",
      });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google Login Failed",
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

module.exports = { register, login, logout, googleLogin };
