const express = require('express')
const router = express.Router()
const DiscountController = require("../app/controllers/DiscountController")

router.get('/getAll',DiscountController.getAllDiscount)
router.get('/:id',DiscountController.getByIdDiscount)

router.post('/create', DiscountController.addDiscount)
router.post('/filter', DiscountController.filterDiscount)

router.put('/:id', DiscountController.updateDiscount)

router.post('/:id', DiscountController.delDiscount)


module.exports = router