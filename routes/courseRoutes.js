const express = require("express");
const router = express.Router();

const {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controller/courseController");

const { protect, authorize } = require("../middleware/authMiddleware");

/* ================= PUBLIC ================= */
// Get all courses
router.get("/", getCourses);

/* ================= ADMIN ONLY ================= */
// Add course
router.post("/", protect, authorize("admin"), addCourse);

// Update course
router.put("/:id", protect, authorize("admin"), updateCourse);

// Delete course
router.delete("/:id", protect, authorize("admin"), deleteCourse);

module.exports = router;
