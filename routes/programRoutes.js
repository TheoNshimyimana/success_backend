const express = require("express");
const router = express.Router();

const {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById
} = require("../controller/programController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.get("/", getPrograms);
router.get("/:id", getProgramById); // ✅ ADD THIS

// Admin
router.post("/", protect, authorize("admin"), createProgram);
router.put("/:id", protect, authorize("admin"), updateProgram);
router.delete("/:id", protect, authorize("admin"), deleteProgram);

module.exports = router;
