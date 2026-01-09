require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const programRoutes = require("./routes/programRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const courseEnrollmentRoutes = require("./routes/courseEnrollmentRoutes");

const app = express();

// ================= CORS =================
// Allow your Netlify frontend (replace with your actual Netlify URL)
const FRONTEND_URL = process.env.FRONTEND_URL || "https://success-tech-fr.netlify.app"; // fallback to * for testing
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // only needed if using cookies
  })
);

// ================= JSON PARSING =================
app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/course-enrollments", courseEnrollmentRoutes);
app.use("/uploads", express.static("uploads"));

// ================= MONGODB CONNECTION =================
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || "myDatabase",
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
