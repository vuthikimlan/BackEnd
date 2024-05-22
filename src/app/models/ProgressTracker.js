const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const progressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    completedLectures: [
      {
        lectureId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("ProgressTracker", progressSchema);
