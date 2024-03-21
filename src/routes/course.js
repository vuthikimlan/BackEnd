const express = require('express')
const router = express.Router()
const CourseController = require('../app/controllers/CourseController')

router.get('/getAll', CourseController.getAllCourse)
router.get('/:id', CourseController.getCourseById)

router.post('/create', CourseController.addCourse)
router.post('/filter', CourseController.filterCourse)
router.post('/:courseId/apply-discount', CourseController.applyDiscount)

router.put('/:id', CourseController.updateCourse)
router.put('/:courseId/reset-discount', CourseController.resetDiscount)

router.delete('/:id', CourseController.deleteCourse)

module.exports = router