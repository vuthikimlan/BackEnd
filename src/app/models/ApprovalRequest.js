
const { default: mongoose, Mongoose } = require("mongoose");

const Schema = mongoose.Schema

const approvalRequestSchema = new Schema ({
   courseId: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'

    }
},{
    timestamps: true,
})

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema)
