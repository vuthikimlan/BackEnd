const express = require('express')
const router = express.Router()
const CommentController = require('../app/controllers/CommentController')

router.get('/getAll', CommentController.getAllComment)

router.post('/:courseId/filter', CommentController.filterComment)

router.put('/:courseId', CommentController.updateComment)

router.delete('/:courseId/:commentId', CommentController.delComment)


module.exports = router