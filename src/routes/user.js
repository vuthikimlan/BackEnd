const express = require('express')
const router = express.Router()
const UserController = require('../app/controllers/UserController')
const addMiddleware = require('../app/middleware/User/addMiddleware')
const updateMiddleware = require('../app/middleware/User/updateMiddleware')

router.get('/getAll', UserController.getAllUser)
router.get('/:id', UserController.getUserById)
// router.get('/cart/:userId', UserController.getCart)
router.get('/cart/getAll', UserController.getCarts)

router.post('/create', addMiddleware ,UserController.addUser)
router.post('/filter', UserController.filterUser)

router.post('/addCart/:courseId', UserController.addToCart)

router.put('/:id', updateMiddleware ,UserController.updateUser)

router.delete('/:id', UserController.deleteUser)
router.delete('/cart/:courseId', UserController.deleteCart)

module.exports = router