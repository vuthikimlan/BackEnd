const express = require('express')
const router = express.Router()
const OrderController = require('../app/controllers/OrderController')

router.get('/getAll', OrderController.getAllOrder)
router.get('/:id', OrderController.getByIdOrder)

router.post('/create', OrderController.addOrder)
router.post('/filter', OrderController.filterOrder)

router.put('/:id', OrderController.updateOrder)

router.delete('/:id', OrderController.delOrder)


module.exports = router