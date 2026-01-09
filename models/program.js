const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },               // YES Program
    subtitle: { type: String, required: true },            // Youth Entrepreneurship & Startup Program
    description: { type: String, required: true },

    features: [{ type: String }],                           // bullet list

    icon: { type: String, required: true },                 // HiOutlineRocketLaunch, TbWorld, etc
    themeColor: { type: String, default: "#41933A" },       // button & accent color

    ctaText: { type: String, default: "Learn More" },
    ctaLink: { type: String, default: "/contact" },

    imagePosition: {
      type: String,
      enum: ["left", "right"],
      default: "right",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Program || mongoose.model("Program", programSchema);
