const CourseEnrollment = require("../models/CourseEnrollment");
const Course = require("../models/course");

/**
 * @desc    Enroll logged-in user into a course
 * @route   POST /api/course-enrollments
 * @access  Private (User)
 */
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existing = await CourseEnrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existing) {
      return res.status(400).json({
        message: "You are already enrolled in this course"
      });
    }

    const enrollment = await CourseEnrollment.create({
      user: req.user._id,
      course: courseId
    });

    res.status(201).json({
      message: "Course enrollment successful",
      enrollment
    });
  } catch (error) {
    console.error("Course enrollment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get logged-in user's course enrollments
 * @route   GET /api/course-enrollments/my
 * @access  Private (User)
 */
exports.getMyCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({
      user: req.user._id
    })
      .populate("course", "title description")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all course enrollments (Admin)
 * @route   GET /api/course-enrollments
 * @access  Private (Admin)
 */
exports.getAllCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find()
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update course enrollment status
 * @route   PUT /api/course-enrollments/:id
 * @access  Private (Admin)
 */
exports.updateCourseEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const enrollment = await CourseEnrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.status = status;
    await enrollment.save();

    res.json({
      message: "Course enrollment status updated",
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete course enrollment
 * @route   DELETE /api/course-enrollments/:id
 * @access  Private (Admin)
 */
exports.deleteCourseEnrollment = async (req, res) => {
  try {
    const enrollment = await CourseEnrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    await enrollment.deleteOne();

    res.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
