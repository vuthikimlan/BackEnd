const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        require: true,
        enum: ["STUDENT", "TEACHER", "ADMIN"]
    },
    phone: {
        type: String,
    },
    avatar: {
        type: String,
    },
    boughtCourses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    coursesPosted: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    countCourseCart: {
        type: Number,
        default: 0
    },
    shoppingCart: [{
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        },
        quantity: {
            type: Number,
            default: 1,
        }
    }],
    teacher: {
        specialization: {
            type: String
        },
        experience: {
            type: String,
        },
        facebook: {
            type: String,
        },
        pendingEarning: {
            type: Number,
        },
        paidEarning: {
            type: Number,
        }
    },
    paymentMethod: {
        brand: {
            type: String,
            enum: ["VISA", "TEACHER", "ADMIN"]
        },
        accountNumber:{
            type: String,
        } ,
        accountName: {
            type: String,
        },
        bankCode:{
            type: String,
        }

    },
    order: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpirse: {
        type: Date
    }
},{
    timestamps: true,
})

module.exports = mongoose.model('User', userSchema)