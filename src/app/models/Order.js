const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const orderSchema = new Schema({
    price: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    orderDate: {
        type: Date,
    },
    status: {
        type: String,
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: ''
        }
    ],
    user: [
        {
            type: Schema.Types.ObjectId
        }
    ]
    
},{
    timestamps: true,
})