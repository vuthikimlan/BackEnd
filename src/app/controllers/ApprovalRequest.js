const ApprovalRequest = require("../models/ApprovalRequest");
const Course = require("../models/Course");

class ApprovalRequestController{
    async createRequest(req, res) {
        try {
            const {courseId} = req.params
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

        const items = await ApprovalRequest.find({status: 'pending' })
        .populate({
            path: 'courseId',
            populate: {
                path: 'field',
                select: 'title'
            }
        })
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

        const items = await ApprovalRequest.find({status: 'approved' })
        .populate({
            path: 'courseId',
            populate: {
                path: 'field',
                select: 'title'
            }
        })
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

    async getCourseRejected(req, res) {
        const totalRejected = await ApprovalRequest.countDocuments({status: 'rejected' })

        const items = await ApprovalRequest.find({status: 'rejected' })
        .populate({
            path: 'courseId',
            populate: {
                path: 'field',
                select: 'title'
            }
        })
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalRejected,
                items
            }
        })
    }

    async updateApprove(req, res) {
        try {
            const requestId = req.params.id;
            const status = req.body.status

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