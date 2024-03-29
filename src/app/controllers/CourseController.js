const { isValidObjectId } = require('mongoose')
const Course = require('../models/Course')
const jwt = require('jsonwebtoken')
const { default: slugify } = require('slugify')
const Users = require('../models/Users')
const Discount = require('../models/Discount')
const Field = require('../models/Field')

class CourseController {
    async addCourse(req, res) {
        try {

            const {partName, lectureName, video, descriptionLectures,
                 document, isFree, timeOfSection, field, topic
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


            // Tính tổng số bài giảng của khóa học 

            const newCourseData =  { ...req.body, 
                field,
                topic ,
                createdBy:{
                    name: name,
                    username: username,
                },
                parts: [{
                    partName: partName,
                    lectures: [{
                        lectureName: lectureName,
                        descriptionLectures: descriptionLectures,
                        video: video,
                        document: document,
                        isFree: isFree,
                    }],
                    timeOfSection: timeOfSection,
                }],
                
            }

            const newCourse = new Course(newCourseData)
            
            const saveCourse = await newCourse.save()

            // người dùng Khi tạo khóa học mới thì khóa học cx đc
            // Lưu vào trường khóa học mà người đó đã tạo
            const user = await Users.findById({_id: userId})
            user.coursesPosted.push(saveCourse._id);
            await user.save();

            // Khi tạo thể loại mới thì thể loại đó cũng cần lưu lại khóa học đó
            await Field.findByIdAndUpdate(
                field, //Tim den the loai
                {$push: {"topics.$[topicId].courses": newCourse._id}},
                {arrayFilters: [{"topicId._id": topic}]}
            )

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
        .populate('field', 'title')
    
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

    async applyDiscount(req, res) {
        try {
            const {courseId} = req.params
            const {discountCode} = req.body

            // Kiem tra ma giam gia co ton tai khong
            const existingDiscountCode = await Discount.findOne({discountCode})
            if (!existingDiscountCode) {
                res.json({
                    message: "Mã giảm giá không tồn tại"
                });
            } else if (existingDiscountCode.expiryDate < new Date()) {
                res.json({
                    message: "Mã giảm giá đã hết hạn sử dụng"
                });
            }

            // Lấy thông tin khóa học
            const course = await Course.findById(courseId)
            // Ap dung ma giam gia cho khoa hoc
            course.discountedCodeApplied = discountCode
            course.discountedPrice = course.price * (1 - existingDiscountCode.discountRate / 100 )

            const discountCourse = await course.save()
            res.status(200).json({
                success: true,
                data: discountCourse
            })
            
        } catch (error) {
            console.log('error', error);
        }
    }

    async resetDiscount(req, res) {
        try {
            const {courseId} = req.params
            const course = await Course.findById(courseId)
    
            course.discountedPrice = null
            course.discountedCodeApplied = null
    
            const resetDiscount = await course.save()
    
            res.status(200).json({
                success: true,
                data: resetDiscount
            })
        } catch (error) {
            console.log('error', error);
        }
    }

}

module.exports = new CourseController