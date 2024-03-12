const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    slug:{
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    field: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true
    },
    lessonContent: {
        type: [String],
    },
    totalTimeCourse: {
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
        enum: ["PRIMARY", "INTERMEDIATE", "ALL LEVELS"]
    },
    isApprove: {
        type: Boolean,
        default: false,
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
        timeOfSection: {
            type: Number,
        },
        totalTimeLectures: {
            type: Number,
        },
        totalLecture: {
            type: Number
        }
    }],
    users:[
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdBy: {
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
            ref: 'Comment'
        }
    ],
    totalRatings: {
        type: Number,
        default: 0,
    }
    

},{
    timestamps: true,
})

module.exports = mongoose.model('Course', courseSchema)