const express = require("express");
const router = express.Router();

const {
  enrollCourse,
  getMyCourseEnrollments,
  getAllCourseEnrollments,
  updateCourseEnrollmentStatus,
  deleteCourseEnrollment
} = require("../controller/courseEnrollmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

// User
router.post("/", protect, enrollCourse);
router.get("/my", protect, getMyCourseEnrollments);

// Admin
router.get("/", protect, authorize("admin"), getAllCourseEnrollments);
router.put("/:id", protect, authorize("admin"), updateCourseEnrollmentStatus);
router.delete("/:id", protect, authorize("admin"), deleteCourseEnrollment);

module.exports = router;
