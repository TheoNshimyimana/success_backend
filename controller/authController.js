const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
  
// ================= REGISTER =================
async function register(req, res) {
  try {
    const { name, email, password, phone, profilePicture } = req.body;

    // 1️⃣ Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // 2️⃣ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // 3️⃣ Email domain validation
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "aol.com",
      "icloud.com",
      "live.com",
      "protonmail.com",
      "zoho.com",
      "stlab.rw"
    ];

    const emailDomain = email.split("@")[1].toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      return res.status(400).json({
        message:
          "Email provider not supported. Use Gmail, Yahoo, Outlook, AOL, etc.",
      });
    }

    // 4️⃣ Password validation (> 8, letters + numbers)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 5 characters long and contain both letters and numbers",
      });
    }

    // 5️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 6️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7️⃣ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      profilePicture,
    });

    // 8️⃣ JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// ================= LOGIN =================
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "4h" } // ✅ expires in 4 hours
    );

    res.status(200).json({
      token,
      expiresIn: "4 hours", // (optional, helpful for frontend)
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
// ================= FORGOT PASSWORD =================
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save({ validateBeforeSave: false });

    // Reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email content
    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password.</p>
      <p>Click the button below to reset it:</p>
      <a href="${resetUrl}" 
         style="display:inline-block;padding:10px 20px;
                background:#0D7377;color:#fff;
                text-decoration:none;border-radius:5px;">
         Reset Password
      </a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn’t request this, ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: message,
    });

    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Email could not be sent" });
  }
}


// ================= RESET PASSWORD =================
async function resetPassword(req, res) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Token invalid or expired" });

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
}

// ================= CHANGE PASSWORD =================
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // 1️⃣ Check required fields
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check new password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // 3️⃣ Validate new password: >8 chars, letters + numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{9,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 9 characters and include both letters and numbers",
      });
    }

    // 4️⃣ Get current user from req.user (middleware should attach it)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 5️⃣ Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 6️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
}



// ================= GET USERS =================
async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// ================= DELETE USER =================
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Get current logged-in user
// ================= GET CURRENT USER =================
async function getMe(req, res) {
  try {
    // req.user is already attached by the protect middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}



// ================= UPDATE USER =================


// Configure storage for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Your updateUser controller
const updateUser = async (req, res) => {
  try {
    // req.body will now contain form fields
    const { name, email, phone, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (password) {
      user.password = password; // Make sure you hash it if needed
    }

    if (req.file) {
      // Save profile picture path
      user.profilePicture = req.file.path;
    }

    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateUser, upload };



// ================= EXPORTS =================
module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getUsers,
  deleteUser,
  updateUser,
  getMe,
};

