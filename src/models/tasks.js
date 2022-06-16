const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    description: {
      required: [true, "Enter your task"],
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    strictPopulate: false,
  }
);

module.exports = mongoose.model("Task", taskSchema);
