const express = require('express')
const router = express.Router()
const PaymentController = require('../app/controllers/PaymentController')

router.post('/create_payment_url', PaymentController.createPaymentWithVNPAY)
router.post('/create_payment_momo', PaymentController.createPaymentWithMoMo)



module.exports = router