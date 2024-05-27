const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    author: {
      nameAuthor: {
        type: String,
      },
      avatar: {
        type: String,
      },
    },
    field: {
      title: {
        type: String,
      },
      slugField: {
        type: String,
        lowercase: true,
      },
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);
