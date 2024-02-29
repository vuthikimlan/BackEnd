const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const blogSchema = new Schema ({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    author: {
        type: String,
        require: true,
    },
    field: {
        type: String,
    },
    content: {
        type: String,
    }

},{
    timestamps: true,
})

module.exports = mongoose.model('Blog', blogSchema)
