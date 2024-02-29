const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const discountSchema = new Schema({
    discountCode: {
        type: String,
        require: true,
    },
    expiryDate: {
        type: Date,
        require: true,
    },
    discountRate:{
        type: Number,
        require: true
    },
    status: {
        type: String,
        require: true,
    },

},{
    timestamps: true,
})

module.exports = mongoose.model("Discount", discountSchema)