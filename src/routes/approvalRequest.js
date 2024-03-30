const express = require('express')
const router = express.Router()

const ApprovalRequest = require('../app/controllers/ApprovalRequest')

router.post('/approval-request/:courseId', ApprovalRequest.createRequest)
router.get('/pending', ApprovalRequest.getCoursePending)
router.get('/approved', ApprovalRequest.getCourseApproved)
router.get('/rejected', ApprovalRequest.getCourseRejected)
router.put('/updateStatus/:id', ApprovalRequest.updateApprove)



module.exports = router
