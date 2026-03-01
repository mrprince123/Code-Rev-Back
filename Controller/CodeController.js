const Code = require("../Model/codeModel");
const Reviewer = require("../Model/reviewModel");
const Likes = require("../Model/likeModel");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { default: slugify } = require("slugify");

// AI Config
const apiKey = process.env.CHAT_API;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Structured JSON schema for production-grade reviews
const reviewResponseSchema = {
  type: "object",
  properties: {
    verdict: {
      type: "string",
      enum: [
        "Production Ready",
        "Good",
        "Needs Improvement",
        "Critical Issues",
      ],
      description: "Overall quality verdict for the code",
    },
    overallScore: {
      type: "number",
      description: "Overall quality score from 1 to 10",
    },
    summary: {
      type: "string",
      description:
        "A concise 2-3 sentence summary of the code quality and key findings",
    },
    categories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Category name",
          },
          score: {
            type: "number",
            description: "Score for this category from 1 to 10",
          },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                severity: {
                  type: "string",
                  enum: ["critical", "warning", "suggestion"],
                  description: "Severity level of the issue",
                },
                title: {
                  type: "string",
                  description: "Short title of the issue",
                },
                description: {
                  type: "string",
                  description: "Detailed description of the issue",
                },
                suggestion: {
                  type: "string",
                  description: "How to fix or improve this issue",
                },
                codeSnippet: {
                  type: "string",
                  description:
                    "Optional code snippet showing the fix. Use actual code, not markdown.",
                },
              },
              required: ["severity", "title", "description", "suggestion"],
            },
          },
        },
        required: ["name", "score", "issues"],
      },
    },
    refactoredCode: {
      type: "string",
      description:
        "The complete refactored/improved version of the submitted code",
    },
    testingSuggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          testName: {
            type: "string",
            description: "Name of the test case",
          },
          description: {
            type: "string",
            description: "What this test should verify",
          },
          priority: {
            type: "string",
            enum: ["high", "medium", "low"],
            description: "Priority of this test",
          },
        },
        required: ["testName", "description", "priority"],
      },
    },
  },
  required: [
    "verdict",
    "overallScore",
    "summary",
    "categories",
    "refactoredCode",
    "testingSuggestions",
  ],
};

const generationConfig = {
  temperature: 0.4,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: reviewResponseSchema,
};

// Build the AI review prompt
const buildReviewPrompt = (description, language, tags, code) => {
  return `You are a senior software engineer conducting a thorough, production-grade code review.

**Context:**
- **Description:** ${description}
- **Language:** ${language}
- **Tags:** ${Array.isArray(tags) ? tags.join(", ") : tags}

**Code to Review:**
\`\`\`${language}
${code}
\`\`\`

**Review Instructions:**
Perform an exhaustive code review as if this code is being submitted for a production deployment. Analyze the code across the following 6 categories and assign each a score from 1-10:

1. **Code Correctness** — Logic errors, bugs, edge cases, type issues, off-by-one errors, null/undefined handling
2. **Best Practices** — Clean code principles, SOLID, DRY, naming conventions, ${language}-specific idioms and patterns
3. **Performance** — Time/space complexity, unnecessary computations, memory leaks, N+1 queries, caching opportunities
4. **Security** — Injection vulnerabilities, input validation, authentication/authorization gaps, data exposure, XSS/CSRF
5. **Error Handling** — Try-catch usage, graceful degradation, error propagation, logging, user-facing error messages
6. **Readability & Maintainability** — Code structure, comments, modularity, function length, complexity

For each category, list specific issues found. Classify each issue by severity:
- **critical** — Must fix before production. Bugs, security holes, data loss risks.
- **warning** — Should fix. Poor patterns that will cause problems at scale.
- **suggestion** — Nice to have. Improvements for code quality and developer experience.

Also provide:
- A **verdict** summarizing overall quality: "Production Ready", "Good", "Needs Improvement", or "Critical Issues"
- An **overall score** (1-10) that reflects the weighted average (Security & Correctness weigh more)
- A **refactored version** of the entire code implementing your suggestions
- **Testing suggestions** — specific test cases that should be written, with priority levels

Be specific. Reference actual code from the submission. Do not give generic advice.`;
};

// Create New Code
const createCode = async (req, res) => {
  const { userId } = req.user;
  const { title, description, code, language, tags, visibility } = req.body;

  const slug = slugify(title, { lower: true, strict: true });

  try {
    // Basic Validations
    if (!title || !slug || !description || !code || !tags || !visibility) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    // AI Review — isolated so code is saved even if AI fails
    let aiResponse = null;
    let aiScore = null;
    let aiVerdict = null;
    let aiReviewFailed = false;

    try {
      const codeReview = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await codeReview.sendMessage(
        buildReviewPrompt(description, language, tags, code),
      );

      const responseText = await result.response.text();
      aiResponse = JSON.parse(responseText);
      aiScore = aiResponse.overallScore || null;
      aiVerdict = aiResponse.verdict || null;
    } catch (aiError) {
      console.log("AI Review Failed: ", aiError.message);
      aiReviewFailed = true;
    }

    const newCode = await Code.create({
      title,
      slug,
      description,
      code,
      language,
      tags,
      visibility,
      authorId: userId,
      aiResponse,
      aiScore,
      aiVerdict,
    });

    return res.status(201).json({
      success: true,
      data: newCode,
      aiReviewFailed,
      message: aiReviewFailed
        ? "Code saved but AI review failed. You can retry the review."
        : "Code Added Successfully",
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
    const { slug } = req.params;

    const code = await Code.findOne({ slug: slug })
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
    const { slug } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "No Authenticated User",
      });
    }

    const code = await Code.findOne({ authorId: userId, slug: slug })
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
  const { slug } = req.params;
  const codeUpdate = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "No Authenticated User",
    });
  }

  try {
    const code = await Code.findOne({ slug });

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

    if (codeUpdate.title) {
      codeUpdate.slug = slugify(codeUpdate.title, {
        lower: true,
        strict: true,
      });
    }

    const updatedCode = await Code.findOneAndUpdate(
      { slug: slug },
      codeUpdate,
      {
        new: true,
        runValidators: true,
      },
    );

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
    const { slug } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "No Authenticated User",
      });
    }

    const code = await Code.findOne({ slug });

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

    await Code.findOneAndDelete({ slug: slug });

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

// Re-Review Code — retry or refresh the AI review
const reReviewCode = async (req, res) => {
  try {
    const { userId } = req.user;
    const { slug } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "No Authenticated User",
      });
    }

    const code = await Code.findOne({ slug });

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found",
      });
    }

    if (code.authorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to re-review this Code!!",
      });
    }

    // Run the AI review
    const codeReview = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await codeReview.sendMessage(
      buildReviewPrompt(
        code.description,
        code.language,
        code.tags,
        code.code
      )
    );

    const responseText = await result.response.text();
    const aiResponse = JSON.parse(responseText);

    // Update the code with the new review
    const updatedCode = await Code.findOneAndUpdate(
      { slug },
      {
        aiResponse,
        aiScore: aiResponse.overallScore || null,
        aiVerdict: aiResponse.verdict || null,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedCode,
      message: "Code Re-Reviewed Successfully",
    });
  } catch (error) {
    console.log("Re-Review Error: ", error);
    return res.status(500).json({
      success: false,
      message: "AI Review failed. Please try again.",
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
  reReviewCode,
};
