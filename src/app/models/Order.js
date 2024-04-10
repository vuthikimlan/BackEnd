const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const orderSchema = new Schema({
    orderId: {
        type: String,
    },
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
        default: 'pending',
        enum: ['pending', 'cancelled', 'completed']
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    user:{
            type: Schema.Types.ObjectId,
            ref: 'User'
    },
    
    
},{
    timestamps: true,
})

module.exports = mongoose.model('Order', orderSchema)