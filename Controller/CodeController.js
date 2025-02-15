const { populate } = require("dotenv");
const Code = require("../Model/codeModel");
const Reviewer = require("../Model/reviewModel");
const Likes = require("../Model/likeModel");

// Create New Code
const createCode = async (req, res) => {
  const { userId } = req.user;
  const { title, description, code, language, tags, status, visibility } =
    req.body;

  try {
    // Basic Validations
    if (!title || !description || !code || !tags || !status || !visibility) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const newCode = await Code.create({
      title,
      description,
      code,
      language,
      tags,
      status,
      visibility,
      authorId: userId,
    });

    return res.status(201).json({
      success: true,
      data: newCode,
      message: "Code Added Successfull",
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

// Get All Code of Specifc User
const getAllCodes = async (req, res) => {
  try {
    const { userId } = req.user;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const codes = await Code.find({ authorId: userId })
      .populate({
        path: "reviews",
        populate: {
          path: "reviewerId",
          model: "User",
          select: "_id name email profilePicture",
        },
        select: "_id reviewerId rating comment createdAt", // Select fields to return
      })
      .populate({
        path: "likes",
        select: "userId",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the Total Count of the Codes
    const total = await Code.countDocuments({ authorId: userId });

    return res.status(200).json({
      success: true,
      data: codes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
      message: "All Code Fetched Successfull",
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

// Get Specific Code Details of Public
const getPublicCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const code = await Code.findOne({ _id: id })
      .populate({
        path: "authorId",
        model: "User",
        select: "name email profilePicture",
      })
      .populate({
        path: "reviews",
        populate: {
          path: "reviewerId",
          model: "User",
          select: "name email profilePicture",
        },
        select: "reviewerId rating comment createdAt", // Select fields to return
      })
      .exec();

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code Not Found with Provide Id!!",
      });
    }

    return res.status(200).json({
      success: true,
      data: code,
      message: "Code Fetched Successfull",
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

// Get Specific Code Details of User
const getCodeById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "No Authenticated User",
      });
    }

    const code = await Code.findOne({ authorId: userId, _id: id })
      .populate({
        path: "authorId",
        model: "User",
        select: "name email profilePicture",
      })
      .populate({
        path: "reviews",
        populate: {
          path: "reviewerId",
          model: "User",
          select: "name email profilePicture",
        },
        select: "reviewerId rating comment createdAt", // Select fields to return
      })
      .exec();

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code Not Found with Provide Id!!",
      });
    }

    return res.status(200).json({
      success: true,
      data: code,
      message: "Code Fetched Successfull",
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

// Update Specific Code
const updateCodeById = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const codeUpdate = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "No Authenticated User",
    });
  }

  try {
    const code = await Code.findById(id);

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found",
      });
    }

    if (code.authorId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized to update this Code!!",
      });
    }

    const updatedCode = await Code.findByIdAndUpdate(id, codeUpdate, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: updatedCode,
      message: "Code Updated Successfull",
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

// Delete Specific Code
const deleteCodeById = async (req, res) => {
  // if the Code is delete then I also want to
  // delete the related code review and  likes

  try {
    const { userId } = req.user;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "No Authenticated User",
      });
    }

    const code = await Code.findById(id);

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found",
      });
    }

    if (code.authorId.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized to delete this Code!!",
      });
    }

    // Delete all reviews on this Code
    await Reviewer.deleteMany({ reviews: userId });

    // Delete all likes on this Code
    await Likes.deleteMany({ likes: userId });

    await Code.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Code Deleted Successfull",
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

// Get all Codes which is Public
const getAllPublicCodes = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const codes = await Code.find({ visibility: "public" })
      .populate({
        path: "likes",
        select: "userId",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get the Total Count of the Public Codes
    const total = await Code.countDocuments({ visibility: "public" });

    return res.status(200).json({
      success: true,
      data: codes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total,
      message: "All Public Code Fetched Successfull",
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

module.exports = {
  createCode,
  getAllCodes,
  getPublicCodeById,
  getCodeById,
  deleteCodeById,
  updateCodeById,
  getAllPublicCodes,
};
