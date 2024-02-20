const { isValidObjectId } = require('mongoose')
const Course = require('../models/Course')

class CourseController {
    async addCourse(req, res) {
        try {
            const newCourse = new Course(req.body)
            
            const saveCourse = await newCourse.save()

            res.status(200).json({
                data: saveCourse,
                error: null,
                statusCode: 200,
                success: true,
            })

        } catch (error) {
            console.log("error", error)
        }
    }

    async getAllCourse(req, res) {
        const totalCourse = await Course.countDocuments()
        const items = await Course.find({}).populate('users')
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalCourse,
                items
            }
        })
    }

    async getCourseById(req, res) {
        const _id = req.params._id
        if(isValidObjectId(_id)) {
            const course = await Course.findById({ _id: id}).populate('users')
            
            res.status(200).json({
                success:true,
                error:null,
                statusCode: 200,
                data: course
            })
        }
    }

    async updateCourse(req, res) {
        try {
            const updateCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {new: true})
    
            if(!updateCourse) {
                return res.status(404).json({
                    message: "Không tìm thấy bản ghi",
                    statusCode: 404,
                    success: false
                })
            }
    
            res.status(200).json({
                data: updateCourse,
                error: null,
                statusCode: 200,
                success: true
            })
            
        } catch (error) {
           res.status(500).json(error) 
        }
    }

    async deleteCourse(req, res) {
        try {
            await Course.deleteOne({_id: req.params.id})
            res.status(200).json({
                message: "Xóa người dùng thành công"
            })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async filterCourse(req, res) {
        try {
            const {name, field, category} = req.body
            let filter = {}

            if(name) filter.name = {$regex: new RegExp(name, 'i')}
            if(field) filter.name = {$regex: new RegExp(field, 'i')}
            if(category) filter.name = {$regex: new RegExp(category, 'i')}

            const result = await Course.find(filter)
            const totalCourse = await Course.countDocuments(filter)

            res.json(
                {
                    success: true,
                    error: null,
                    statusCode: 200,
                    data: {
                        total: totalCourse,
                        items: result
                    }
                }
            )

        } catch (error) {
            res.status(500).json({
                error: 'Có lỗi trong quá trình xử lý yêu cầu'
            })
        }
    }

}

module.exports = new CourseController