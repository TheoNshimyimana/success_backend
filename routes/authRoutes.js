const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  updateUser,
  getMe,
  changePassword, 
} = require("../controller/authController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected routes
router.get("/users", protect, authorize("admin"), getUsers);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// ✅ New route for profile
router.get("/me", protect, getMe);

// Admin/User update with optional profile picture
router.put(
  "/users/:id",
  protect,
  authorize("admin", "user"),
  upload.single("profilePicture"),
  updateUser
);

// ✅ Change password route
router.put("/change-password", protect, changePassword);

module.exports = router;
