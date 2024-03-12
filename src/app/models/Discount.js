const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const discountSchema = new Schema({
    discountCode: {
        type: String,
        require: true,
        uppercase: true,
    },
    expiryDate: {
        type: Date,
        require: true,
    },
    discountRate:{
        type: Number,
        require: true
    },
    active: {
        type: Boolean,
        default: true,
    },

},{
    timestamps: true,
})

module.exports = mongoose.model("Discount", discountSchema)