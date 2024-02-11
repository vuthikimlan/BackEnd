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
    },
    phone: {
        type: String,
    },
    avatar: {
        type: String,
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    shoppingCart: [ {
        type: Schema.Types.ObjectId
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
        accountNumber:{
            type: String,
        } ,
        accountName: {
            type: String,
        },
        bankCode:{
            type: String,
        }

    }


},{
    timestamps: true,
})


module.exports = mongoose.model('User', userSchema)