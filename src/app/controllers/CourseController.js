const { isValidObjectId } = require('mongoose')
const Course = require('../models/Course')
const jwt = require('jsonwebtoken')
const { default: slugify } = require('slugify')
const Users = require('../models/Users')

class CourseController {
    async addCourse(req, res) {
        try {

            const {partName, lectureName, video, descriptionLectures,
                 document, isFree, timeOfSection,
                 totalLecture,totalTimeLectures
            } = req.body

            if(req.body && req.body.name){
                req.body.slug = slugify(req.body.name)
            }
            //Khi tạo khóa học cần biết ai là người tạo khóa học
            // Khi người dùng đăng nhập thì sẽ  lấy thông tin của
            // người dùng và đưa vào trường createBy
            const token = req.headers?.authorization?.split(" ")[1]

            const userInfor = jwt.verify(token, "This is JWT")  
            const userId = userInfor.data._id            
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
                    descriptionLectures: descriptionLectures,
                    video: video,
                    document: document,
                    isFree: isFree,
                    timeOfSection: timeOfSection,
                    totalLecture: totalLecture,
                    totalTimeLectures: totalTimeLectures,
                }
            }

            const newCourse = new Course(newCoureData)
            
            const saveCourse = await newCourse.save()

            // người dùng Khi tạo khóa học mới thì khóa học cx đc
            // Lưu vào trường khóa học mà người đó đã tạo
            const user = await Users.findById({_id: userId})
            user.coursesPosted.push(saveCourse._id);
            await user.save();

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
        .populate({
            path: 'ratings',
            select: 'star comment postedBy', // Chọn các trường cần hiển thị từ ratings
            populate: {
                path: 'postedBy',
                select: 'name username ' // Chọn các trường cần hiển thị từ user
            }
        })
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
                .populate({
                    path: 'ratings',
                    select: 'star comment postedBy', // Chọn các trường cần hiển thị từ ratings
                    populate: {
                        path: 'postedBy',
                        select: 'name username ' // Chọn các trường cần hiển thị từ user
                    }
                })
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
            if(req.body && req.body.title){
                req.body.slug = slugify(req.body.title)
            }
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
            const {name, field, category, price, level} = req.body
            let filter = {}

            if(name) filter.name = {$regex: new RegExp(name, 'i')}
            if(field) filter.field = {$regex: new RegExp(field, 'i')}
            if(category) filter.category = {$regex: new RegExp(category, 'i')}
            if(level) filter.level = {$regex: new RegExp(level, 'i')}
            // Để lọc các khóa học với giá tiền gần giá trị cụ thể, bạn nên sử dụng 
            // các toán tử so sánh số như $lt (nhỏ hơn), $lte (nhỏ hơn hoặc bằng),
            //  $gt (lớn hơn), $gte (lớn hơn hoặc bằng)
            if(price) filter.price = { $gte: parseInt(price) };

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
            // console.log('error', error);
            res.status(500).json({
                error: 'Có lỗi trong quá trình xử lý yêu cầu'
            })
        }
    }

}

module.exports = new CourseController