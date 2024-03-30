const { default: getVideoDurationInSeconds } = require("get-video-duration");
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
        type: Schema.Types.ObjectId,
        ref: 'Field',
        required: true
    },
    topic: {
        type: Schema.Types.ObjectId,
        ref: 'Field.topics',
        required: true
    },
    // Giá gốc
    price: {
        type: Number,
        require: true
    },
    discountedPrice:{
        type: Number
    },
    discountedCodeApplied: {
        type: String
    },
    lessonContent: {
        type: [String],
    },
    totalTimeCourse: {
        type: Number,
        default: 0
    },
    conditionParticipate: [ String],
    
    object:[ String],
    level:{
        type: String,
        enum: ["PRIMARY", "INTERMEDIATE", "ALL LEVELS"]
    },
    isApprove: {
        type: Boolean,
        default: false,
    },
    
    parts: [{
        partName: {
            type: String,
        },
        lectures: [{
            lectureName: {
                type: String,
            },
            video:{
                type: String,
            },
            nameVideo: {
                type: String
            },
            descriptionLectures: {
                type: String,
            },
            document: {
                type: String,
            },
            nameDoc: {
                type: String
            },
            isFree: {
                type: Boolean,
                default: false,
            },
        }],
        totalTimeLectures: {
            type: Number,
            default: 0
        },
        totalLecture: {
            type: Number,
            default: 0
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

courseSchema.pre('save', async function(next) {
    try {
        const parts = this.parts 
        let totalLectureCount = 0
        let totalLectureTime = 0
    
        parts.forEach(parts => {
            totalLectureCount += parts.lectures.length
        })
    
        for(const part of parts ) {
            for(const lecture of part.lectures ){
                const duration = await getVideoDurationInSeconds(lecture.video)
                totalLectureTime += duration
                
            }
    
        }
    
        this.totalLecture = totalLectureCount
        this.totalTimeLectures = totalLectureTime
        next()
    } catch (error) {
       console.log('error', error);
    }

})

module.exports = mongoose.model('Course', courseSchema)