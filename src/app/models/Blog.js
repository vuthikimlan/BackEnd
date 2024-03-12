const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const blogSchema = new Schema ({
    name: {
        type: String,
        require: true,
    },
    image:{
        type: String,
    },
    description: {
        type: String,
    },
    author:{
        nameAuthor: {
            type: String,
        },
        avatar:{
            type: String,
        }
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
