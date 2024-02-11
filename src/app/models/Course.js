const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const courseSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    field: {
        type: String,
    },
    category: {
        type: String,
    },
    price: {
        type: Number,
    },
    lessonContent: {
        type: [String],
    },
    totalTime: {
        type: Date,
    },
    conditionParticipate: {
        type: String,
    },
    object: {
        type: String,
    },
    level:{
        type: String,
    },
    isApprove: {
        type: Boolean,
    },
    discounts: [
        {
            type: Schema.Types.ObjectId,
            ref: ''
        }
    ],
    lectures: [{
        partName: {
            type: String,
        },
        lectureName: {
            type: String,
        },
        video:{
            type: String,
        },
        description: {
            type: String,
        },
        document: {
            type: String,
        },
        isFree: {
            type: Boolean,
        },
        timeOfSection: {
            type: Date,
        },
        totalTime: {
            type: Date,
        },
        totalLecture: {
            type: Number
        }
    }],
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    

},{
    timestamps: true,
})

module.exports = mongoose.model('Course', courseSchema)