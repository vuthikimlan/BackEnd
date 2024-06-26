const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const optionSchema = new mongoose.Schema({
  option: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["multiple-choice", "open-ended"],
  },
  question: { type: String, required: true },
  options: [optionSchema],
  answer: { type: String },
});

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    assignments: [
      {
        nameAssignment: { type: String, required: true },
        descriptionAssignment: { type: String, required: true },
        dueDate: { type: Date, required: true },
        questions: [questionSchema],
      },
    ],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    detailsCourse: {
      type: String,
    },
    image: {
      type: String,
    },
    field: {
      type: Schema.Types.ObjectId,
      ref: "Field",
      required: true,
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Field.topics",
      required: true,
    },
    // Giá gốc
    price: {
      type: Number,
      require: true,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    discountedCodeApplied: {
      type: String,
    },
    lessonContent: {
      type: [String],
    },
    totalTimeCourse: {
      type: Number,
      default: 0,
    },
    totalLecture: {
      type: Number,
      default: 0,
    },
    conditionParticipate: [String],
    object: [String],
    level: {
      type: String,
      enum: ["PRIMARY", "INTERMEDIATE", "ALL LEVELS"],
    },
    isApprove: {
      type: Boolean,
      default: false,
    },
    enrollment: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        isActivated: { type: Boolean, default: false },
        activationDate: { type: Date },
        expirationDate: { type: Date },
      },
    ],
    parts: [
      {
        partName: {
          type: String,
        },
        lectures: [
          {
            lectureName: {
              type: String,
            },
            video: {
              type: String,
            },
            descriptionLectures: {
              type: String,
            },
            document: {
              type: String,
            },
            isFree: {
              type: Boolean,
              default: false,
            },
            duration: {
              type: Number,
              default: 0,
            },
          },
        ],
        totalTimeLectures: {
          type: Number,
          default: 0,
        },
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      _id: {
        type: Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
      username: {
        type: String,
      },
    },
    ratings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
    userRatings: {
      type: Number,
      default: 0,
    },
    numBought: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);
