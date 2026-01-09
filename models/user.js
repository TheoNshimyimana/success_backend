const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: "user" },
    profilePicture: { type: String }, // Add this
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);





module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
