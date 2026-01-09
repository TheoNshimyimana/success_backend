const Enrollment = require("../models/Enrollment");
const Program = require("../models/program");

/**
 * @desc    Enroll logged-in user into a program
 * @route   POST /api/enrollments
 * @access  Private (User)
 */
exports.enrollProgram = async (req, res) => {
  try {
    const { programId } = req.body;

    if (!programId) {
      return res.status(400).json({ message: "Program ID is required" });
    }

    // Check if program exists
    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // Prevent duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      program: programId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "You are already enrolled in this program"
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: req.user._id,
      program: programId
    });

    res.status(201).json({
      message: "Enrollment successful",
      enrollment
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get logged-in user's enrollments
 * @route   GET /api/enrollments/my
 * @access  Private (User)
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate("program", "title subtitle description")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all enrollments (Admin)
 * @route   GET /api/enrollments
 * @access  Private (Admin)
 */
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("user", "name email")
      .populate("program", "title")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update enrollment status (Admin)
 * @route   PUT /api/enrollments/:id
 * @access  Private (Admin)
 */
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.status = status;
    await enrollment.save();

    res.json({
      message: "Enrollment status updated",
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete enrollment (Admin)
 * @route   DELETE /api/enrollments/:id
 * @access  Private (Admin)
 */
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

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
