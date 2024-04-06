const express = require('express')
const router = express.Router()
const BlogController = require('../app/controllers/BlogController')

router.get('/getAll', BlogController.getAllBlog)
// router.get('/:id', BlogController.getByIdBlog)
router.get('/:slug', BlogController.getBySlug)

router.post('/create', BlogController.addBlog)
router.post('/filter', BlogController.filterBlog)

router.put('/:id', BlogController.updateBlog)

router.delete('/:id', BlogController.delBlog)


module.exports = router