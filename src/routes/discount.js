const express = require('express')
const router = express.Router()
const DiscountController = require("../app/controllers/DiscountController")
const updateStatusDiscount = require("../app/middleware/updateStatusDis")

router.get('/getAll',updateStatusDiscount,DiscountController.getAllDiscount)
router.get('/update-status',DiscountController.updateStatus)
router.get('/:id',DiscountController.getByIdDiscount)

router.post('/create', DiscountController.addDiscount)
router.post('/filter', DiscountController.filterDiscount)

router.put('/:id', DiscountController.updateDiscount)

router.delete('/:id', DiscountController.delDiscount)


module.exports = router