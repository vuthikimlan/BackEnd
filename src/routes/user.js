const express = require('express')
const router = express.Router()
const UserController = require('../app/controllers/UserController')
const addMiddleware = require('../app/middleware/User/addMiddleware')
const updateMiddleware = require('../app/middleware/User/updateMiddleware')

router.get('/getAll', UserController.getAllUser)
router.get('/:id', UserController.getUserById)

router.post('/create', addMiddleware ,UserController.addUser)
router.post('/filter', UserController.filterUser)

router.put('/:id', updateMiddleware ,UserController.updateUser)

router.delete('/:id', UserController.deleteUser)

module.exports = router