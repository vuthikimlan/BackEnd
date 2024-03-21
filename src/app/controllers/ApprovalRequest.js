const ApprovalRequest = require("../models/ApprovalRequest");
const Course = require("../models/Course");

class ApprovalRequestController{
    async createRequest(req, res) {
        try {
            const {courseId} = req.body
            const newRequest = new ApprovalRequest({courseId})
    
            await newRequest.save()
    
            res.status(201).json({
                message: "Gửi yêu cầu phê duyệt thành công"
            })
        } catch (error) {
            console.log('error', error);
        }
    }

    async getCoursePending(req, res) {
        const totalAprrove = await ApprovalRequest.countDocuments({status: 'pending' })

        const items = await ApprovalRequest.find({status: 'pending' }).populate('courseId')
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalAprrove,
                items
            }
        })
    }

    async getCourseApproved(req, res) {
        const totalAprrove = await ApprovalRequest.countDocuments({status: 'approved' })

        const items = await ApprovalRequest.find({status: 'approved' }).populate('courseId')
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalAprrove,
                items
            }
        })
    }

    async updateApprove(req, res) {
        try {
            const requestId = req.params.id;
            const {status} = req.body

            await ApprovalRequest.findByIdAndUpdate(requestId, {status})

            const approvalRequest = await ApprovalRequest.findById(requestId)

            if(status === 'approved') {
                if (approvalRequest) {
                    await Course.findOneAndUpdate({_id: approvalRequest.courseId}, {isApprove: true});
                } 
            } else if(status === 'rejected') {
                if (approvalRequest) {
                    await Course.findOneAndUpdate({_id: approvalRequest.courseId}, {isApprove: false});
                }
            
            }

            res.status(200).json({
                message: "Cập nhật thành công"
            })

        } catch (error) {
            console.log('error::: ', error);
        }
    }
}

module.exports = new ApprovalRequestController;