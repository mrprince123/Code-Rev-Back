const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access Denied, Login then try again",
      });
    }

    const secret = process.env.SECRET;
    const decode = jwt.verify(token, secret);
    req.user = decode;
    next();
  } catch (error) {
    console.log("Error while sending token ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Issue",
      error: error.message,
    });
  }
};

module.exports = verifyToken;
