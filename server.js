require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const programRoutes = require("./routes/programRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const courseEnrollmentRoutes = require("./routes/courseEnrollmentRoutes");

const app = express();

/* ===================== CORS FIX (Render + Netlify) ===================== */
const allowedOrigins = [
  "https://success-tech-fr.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ===================== JSON ===================== */
app.use(express.json());

/* ===================== ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/course-enrollments", courseEnrollmentRoutes);
app.use("/uploads", express.static("uploads"));

/* ===================== MONGODB ===================== */
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || "myDatabase",
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
