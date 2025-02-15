# Code Review Platform - Backend (Node.js + Express.js + MongoDB)

## Overview
This repository contains the backend code for the Code Review Platform, built using Node.js, Express.js, and MongoDB. The backend provides RESTful APIs for user authentication, code submission, reviews, likes, approvals, and notifications. It is designed to be scalable, secure, and easy to integrate with the frontend.

## Features
### User Authentication
- JWT-based authentication for secure access.
- Role-based access control (Developer/Reviewer).

### Code Submission
- Submit code snippets with title, description, language, and tags.
- Set visibility (Public/Private) and track submission status (Pending/Approved/Rejected).

### Review & Feedback
- Add comments on specific lines of code.
- Rate submissions (1-5 stars).
- Like or approve code submissions.

### Notifications
- Real-time notifications for reviews, likes, and approvals.
- Mark notifications as read/unread.

### Dashboard & Profile
- Fetch user details, submission history, and review history.
- Track metrics like total reviews, likes, and approvals.

## Tech Stack
- **Backend Framework:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **API Documentation:** Swagger (optional)
- **Validation:** Express Validator
- **Logging:** Winston or Morgan
- **File Uploads:** Multer (optional for profile pictures)

## Folder Structure
```
src/
├── config/               # Configuration files
│   ├── db.js             # MongoDB connection
│   └── jwt.js            # JWT configuration
├── controllers/          # Request handlers
│   ├── authController.js # Authentication logic
│   ├── codeController.js # Code submission logic
│   ├── reviewController.js # Review logic
│   ├── likeController.js # Like/approval logic
│   └── notificationController.js # Notification logic
├── middleware/           # Custom middleware
│   ├── authMiddleware.js # Authentication middleware
│   └── errorHandler.js   # Global error handler
├── models/               # Database models
│   ├── User.js           # User schema
│   ├── Code.js           # Code submission schema
│   ├── Review.js         # Review schema
│   ├── Like.js           # Like/approval schema
│   └── Notification.js   # Notification schema
├── routes/               # API routes
│   ├── authRoutes.js     # Authentication routes
│   ├── codeRoutes.js     # Code submission routes
│   ├── reviewRoutes.js   # Review routes
│   ├── likeRoutes.js     # Like/approval routes
│   └── notificationRoutes.js # Notification routes
├── services/             # Business logic
│   ├── authService.js    # Authentication services
│   ├── codeService.js    # Code submission services
│   ├── reviewService.js  # Review services
│   ├── likeService.js    # Like/approval services
│   └── notificationService.js # Notification services
├── utils/                # Utility functions
│   ├── logger.js         # Logging utilities
│   ├── validators.js     # Validation utilities
│   └── ...               # Other utilities
├── app.js                # Main application file
└── server.js             # Server entry point
```

## Installation

### Clone the repository:
```bash
git clone https://github.com/your-username/code-review-platform-backend.git
```

### Navigate to the project directory:
```bash
cd code-review-platform-backend
```

### Install dependencies:
```bash
npm install
```

### Create a `.env` file in the root directory and add the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/code-review-platform
JWT_SECRET=your_jwt_secret
```

### Start the development server:
```bash
npm start
```
The server will run on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Log in and get a JWT token.

### Code Submission
- `POST /api/code` - Submit a new code snippet.
- `GET /api/code` - Fetch all public code submissions.
- `GET /api/code/:id` - Fetch a specific code submission.
- `PUT /api/code/:id` - Update a code submission.
- `DELETE /api/code/:id` - Delete a code submission.

### Reviews
- `POST /api/review` - Add a review to a code submission.
- `GET /api/review/:id` - Fetch reviews for a specific code submission.

### Likes & Approvals
- `POST /api/like` - Like or approve a code submission.
- `GET /api/like/:id` - Fetch likes/approvals for a specific code submission.

### Notifications
- `GET /api/notifications` - Fetch notifications for the logged-in user.
- `PUT /api/notifications/:id` - Mark a notification as read.

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePicture: String,
  role: { type: String, enum: ["developer", "reviewer"] },
  joinedAt: Date,
  bio: String,
  socialLinks: {
    github: String,
    linkedin: String
  }
}
```

### Code Submission Schema
```javascript
{
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  code: String,
  language: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  status: { type: String, enum: ["pending", "approved", "rejected"] },
  visibility: { type: String, enum: ["public", "private"] }
}
```

## Middleware
### Authentication Middleware
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};
```

## Future Enhancements
- **Real-time Notifications:** Implement WebSocket for real-time updates.
- **AI-based Suggestions:** Integrate AI for automated code review suggestions.
- **Version Control Integration:** Connect GitHub API for automatic code submission.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For any questions or feedback, please reach out to:
- **Email:** your-email@example.com
- **GitHub:** your-username

## Acknowledgments
- Node.js
- Express.js
- MongoDB
- JWT

Happy coding! 🚀
