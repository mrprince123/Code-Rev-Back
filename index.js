require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDatabase = require("./Database/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");

// All Server Config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Allow specific domain(s)
const corsOptions = {
  origin: ["https://coderev.princesahni.com"], // Replace with your front-end URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};
app.use(cors(corsOptions));

// Connect Db here
connectDatabase();

// Root Route
app.get("/", (req, res) => {
  res.send("Hello World!!");
});

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mention All Routes
app.use("/api/v1/auth", require("./Routes/AuthRoute")); // Done
app.use("/api/v1/user", require("./Routes/UserRoute")); // Done
app.use("/api/v1/code", require("./Routes/CodeRoute")); // Done
app.use("/api/v1/review", require("./Routes/ReviewerRoute")); // Done
app.use("/api/v1/like", require("./Routes/LikeRoute")); // Done

// Listen Port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
