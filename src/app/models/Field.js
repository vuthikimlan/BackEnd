const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const fieldSchema = new Schema ({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String
    },
    image: {
        type: String,
    },
    topics: [{
        nameTopic: {
            type: String,
            required: true
        },
        slug: {
            type: String
        }, 
        courses: [{
            type: Schema.Types.ObjectId,
            ref: 'Course'
        }]
    }]

},{
    timestamps: true,
})

module.exports = mongoose.model('Field', fieldSchema)
