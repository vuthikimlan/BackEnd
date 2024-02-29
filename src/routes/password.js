const express = require('express')
const router = express.Router()
const ForgotPassword = require('../app/controllers/ForgotPassword')
const resetPassMiddleware = require('../app/middleware/User/resetPassword')

router.post('/forgot', ForgotPassword.forgotPassword)
router.post('/reset', resetPassMiddleware ,ForgotPassword.resetPassword)

module.exports = router
