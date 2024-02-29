const { isValidObjectId } = require('mongoose')
const Course = require('../models/Course')
const jwt = require('jsonwebtoken')

class CourseController {
    async addCourse(req, res) {
        try {

            const {partName, lectureName, video, 
                 document, isFree, timeOfSection,
                 totalLecture
            } = req.body

            //Khi tạo khóa học cần biết ai là người tạo khóa học
            // Khi người dùng đăng nhập thì sẽ  lấy thông tin của
            // người dùng và đưa vào trường createBy
            const token = req.headers?.authorization?.split(" ")[1]

            const userInfor = jwt.verify(token, "This is JWT")  
            
            const name = userInfor.data.name
            const username = userInfor.data.username

            const newCoureData =  { ...req.body, 
                createdBy:{
                    name: name,
                    username: username,
                },
                lectures: {
                    partName: partName,
                    lectureName: lectureName,
                    video: video,
                    document: document,
                    isFree: isFree,
                    timeOfSection: timeOfSection,
                    totalLecture: totalLecture,
                }
            }

            const newCourse = new Course(newCoureData)
            
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
        try {
            const _id = req.params.id
            
            if(isValidObjectId(_id)) {
                const course = await Course.findById({ _id: _id}).populate('users')
                res.status(200).json({
                    success:true,
                    error:null,
                    statusCode: 200,
                    data: course
                })
            }
        } catch (error) {
            console.log('error', error);
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
                message: "Xóa khóa học thành công"
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
            if(field) filter.field = {$regex: new RegExp(field, 'i')}
            if(category) filter.category = {$regex: new RegExp(category, 'i')}

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