const express = require("express");
const router = express.Router();

const {
  enrollProgram,
  getMyEnrollments,
  getAllEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment
} = require("../controller/enrollmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

// User
router.post("/", protect, enrollProgram);
router.get("/my", protect, getMyEnrollments);

// Admin
router.get("/", protect, authorize("admin"), getAllEnrollments);
router.put("/:id", protect, authorize("admin"), updateEnrollmentStatus);
router.delete("/:id", protect, authorize("admin"), deleteEnrollment);

module.exports = router;
