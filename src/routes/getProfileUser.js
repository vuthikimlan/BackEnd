const express = require('express')
const router = express.Router()
const ProfileController = require('../app/controllers/ProfileController')

router.get('/user', ProfileController.profileUser)

router.put('/updated-profile', ProfileController.updateProfile)


module.exports = router