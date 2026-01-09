const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    students: { type: Number, required: true },
    price: { type: String, required: true },
    topics: [{ type: String }],
    schedule: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Course ||
  mongoose.model("Course", courseSchema);
