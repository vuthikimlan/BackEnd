const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const commentSchema = new Schema ({
    star: {
        type: Number,
    },
    postedBy: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    comment: {
        type: String,
    },
    courses: {
        type: Schema.Types.ObjectId,
        ref: "Course"
    },
    

},{
    timestamps: true,
})

module.exports = mongoose.model('Comment', commentSchema)
