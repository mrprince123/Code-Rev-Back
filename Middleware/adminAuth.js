const adminAuth = (req, res, next) => {
  if (!req.user || req.user.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied! Admin only.",
    });
  }
  next();
};

module.exports = adminAuth;