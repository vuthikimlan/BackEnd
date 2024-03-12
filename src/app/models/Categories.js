const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema

const categorySchema = new Schema ({
    title: {
        type: String,
        require: true,
    },
    subject: [{
        name: {
            type: String,
            require: true
        }
    }]

},{
    timestamps: true,
})

module.exports = mongoose.model('Category', categorySchema)
