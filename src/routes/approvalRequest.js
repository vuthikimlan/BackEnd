const express = require('express')
const router = express.Router()

const ApprovalRequest = require('../app/controllers/ApprovalRequest')

router.post('/approval-request', ApprovalRequest.createRequest)
router.get('/pending', ApprovalRequest.getCoursePending)
router.get('/approved', ApprovalRequest.getCourseApproved)
router.put('/updateStatus/:id', ApprovalRequest.updateApprove)



module.exports = router
