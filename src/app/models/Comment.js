const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    star: {
      type: Number,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    courses: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    reply: {
      content: {
        type: String,
      },
      commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
      postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
