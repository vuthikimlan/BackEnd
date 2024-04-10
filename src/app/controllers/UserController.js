const { validationResult } = require('express-validator')
const { default: mongoose } = require("mongoose");
const { Types: { ObjectId } } = require('mongoose');
const Course = require('../models/Course')
const User = require('../models/Users')
const { isValidObjectId, } = require('mongoose')
const { getIdUser } = require('../../service/getIdUser')
const Order = require('../models/Order')

class UserController {
    async addUser(req, res) {
        try {
            const {specialization, experience, 
                facebook, pendingEarning, paidEarning,
                accountNumber, accountName,
                bankCode } = req.body

            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(200).json({
                    error: {
                        errorList : errors.array(),
                        message: "Tham số không hợp lệ",
                        statusCode: 2,
                        success: false,

                    }
                })
            }

            const newUserData = { ...req.body, 
                teacher:{
                    specialization: specialization,
                    experience:experience,
                    facebook: facebook,
                    pendingEarning: pendingEarning,
                    paidEarning: paidEarning,
                }, 
                paymentMethod:{
                    accountNumber: accountNumber,
                    accountName: accountName,
                    bankCode: bankCode,

                }
            }
            
            const newUser = new User(newUserData)
    
            const courses =  await Course.find({ _id: { $in: req.body.courses } })
    
            newUser.courses = courses
    
            const savedUser = await newUser.save()
    
            await Promise.all(courses.map(course => {
                course.users.push(savedUser._id)
                return course.save()
            }));
    
            res.status(200).json({
                data: savedUser,
                error: null,
                statusCode: 200,
                success: true,
            })
    
        } catch (error) {
            console.log('error', error);
        }
    } 

    async getAllUser(req, res) {
        const totalUser = await User.countDocuments()
        const items = await User.find({})
        .populate('boughtCourses')
        .populate('coursesPosted', "-createdBy ")
        // .populate('order', "_id courses totalPrice")
        .populate({
            path: 'order',
            select: "_id courses totalPrice",
            populate: {
                path: 'courses',
                select: " -image -createdAt -updatedAt -conditionParticipate -object "
            }
        })
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalUser,
                items
            }
        })
    }

    // const teacherId = req.params.teacherId
    async studentofTecher(req, res) {
        try {
            const teacherId = getIdUser(req)
            const user = await User.findById(teacherId)

            let students = [];

            // query 1 lần duy nhất để lấy thông tin các khóa học
            const courses = await Course.find({_id: {$in: user.coursesPosted}}).populate('users', 'name email phone ');

            // Duyệt qua courses lấy danh sách học viên và gán vào mảng
            for (const course of courses) {
                students.push(...course.users); 
            }
            const totalStudent = students.length;

            res.status(200).json({
                success: true,
                error: null,
                statusCode: 200,
                data:{
                    totalStudent,
                    students

                },
            });
            
        } catch (error) {
            console.log('error', error);
            res.status(500).json({ error: 'An error occurred while fetching student-teacher data.' });
        }
    }

    async getUserById(req, res){
        const _id = req.params.id
        if(isValidObjectId(_id)) {
            const user = await User.findById({_id: _id})
            .populate('boughtCourses')
            .populate('coursesPosted', "-createdBy")
            .populate({
                path: 'order',
                select: "_id courses totalPrice",
                populate: {
                    path: 'courses',
                    select: " -image -createdAt -updatedAt -conditionParticipate -object "
                }
            })
            res.status(200).json({
                success: true,
                error:null,
                statusCode: 200,
                data: user
            })
        } else {
            res.status(400).json({
                error:"Định dạng của _id không hợp lệ"
            })
        }
    }

    async updateUser(req, res) {
        try {

            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(200).json({
                    error: {
                        errorList : errors.array(),
                        message: "Tham số không hợp lệ",
                        statusCode: 2,
                        success: false,

                    }
                })
            }

            const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
            if(!updateUser) {
                return res.status(404).json({
                    message: "Không tìm thấy bản ghi",
                    statusCode:404,
                    success: false
                })
            }
            res.status(200).json({
                data: updateUser,
                error:null,
                statusCode: 200,
                success: true
            })
        
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async deleteUser(req, res) {
        try {
            await User.deleteOne({_id: req.params.id})
            res.status(200).json({
                message: "Xóa người dùng thành công"
            })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async filterUser(req, res) {
        try {
            const {name, username, email, accountNumber, accountName, role} = req.body
            let filter = {}

            // So sánh không bằng nhau, có thể tìm với bất kỳ ký tự là viết hoa hay ko
            if(name) filter.name = {$regex: new RegExp(name, 'i')}
            if(username) filter.username = {$regex: new RegExp(username, 'i')}
            if(email) filter.email = {$regex: new RegExp(email, 'i')}
            if(accountNumber) filter.accountNumber = {$regex: new RegExp(accountNumber, 'i')}
            if(accountName) filter.accountName = {$regex: new RegExp(accountName, 'i')}
            if(role) filter.role = {$regex: new RegExp(role, 'i')}

            const result = await User.find(filter)
            const totalUser = await User.countDocuments(filter)
            res.json(
                {
                    success: true,
                    error: null,
                    statusCode: 200,
                    data: {
                        total: totalUser,
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

    async addToCart (req, res) {
        try {
            const {courseId} = req.params
            const userId = getIdUser(req)
            const user = await User.findById(userId)
            let countCourses = 0

            const existingCourse = user?.shoppingCart?.find(item => item.courseId.toString() === courseId)

            if(existingCourse) {
                return res.status(201).json({
                    message: "Khóa học đã tồn tại trong giỏ hàng"
                })
            } 

            const newCartItem = {courseId}
            user.shoppingCart.push(newCartItem)
            // Cập nhật số lượng khóa học trong giỏ hàng khi thêm mới
            countCourses = user.shoppingCart.length
            user.countCourseCart = countCourses

            await user.save()

            res.status(200).json({
                message: "Thêm vào giỏ hàng thành công",
                data: {
                    countCourse: countCourses,
                    items: user.shoppingCart
                }
            })
            
        } catch (error) {
            console.log('error', error);
        }

    }

    async getCarts (req, res) {
        try {
            const userId = getIdUser(req)
            const user = await User.findById(userId).select('shoppingCart').populate('shoppingCart.courseId', 'name image price')
            .populate({
                path: 'shoppingCart.courseId',
                select: 'name image price createdBy discountedCodeApplied discountedPrice totalLecture level totalRatings totalTimeCourse userRatings', 
                populate: {
                    path: 'createdBy',
                    select: 'name username ' // Chọn các trường cần hiển thị từ user
                }
            })
            const countCourse = user.shoppingCart.length;
    
           res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data:{ 
                count: countCourse,
                items: user
            }
           })
        }
        catch (error) {
            res.status(500).json(error)
        }
    }

    async deleteCart (req, res) {
        try {
            const {courseId} = req.params
            const userId = getIdUser(req)
            const user = await User.findById(userId)

            let countCourses = 0

            //Kiểm tra giỏ hàng của người dùng có tồn tại không
            if(!user.shoppingCart || user.shoppingCart === 0) {
                return res.status(200).json({
                    message: "Giỏ hàng trống"
                })
            }
            
            //duyệt qua các khóa học trong giỏ hàng và xóa khóa học có id trùng với courseId 
            user.shoppingCart = user.shoppingCart.filter(item => item.courseId.toString() != courseId)
            //Cập nhật số lượng khóa học sau khi xóa
            countCourses = user.shoppingCart.length
            user.countCourseCart = countCourses

            await user.save()

            res.status(200).json({
                message: "Xóa khóa học khỏi giỏ hàng thành công",
                data: user
            })
            
        } catch (error) {
            
        }
    }


    // Logic để thực hiện tính doanh thu của giảng viên
    // Giảng viên A có id là 123
    // Lấy chi tiết đơn hàng và trong đơn hàng đó kiểm tra
    // xem khóa học có thuộc về giảng viên này không

    async revenueTeacher(req, res) {
        try {
            // const teacherId = getIdUser(req)
            const teacherId = req.params.teacherId

            const orders = await Order.find({status: 'completed'})
                .populate('courses')
                .exec()
            
            //Lọc các đơn hàng có khóa học do giảng viên này tạo
            const relevantOrders = orders.filter(order => {
                return order.courses.some(course => course.createdBy._id.toString() === teacherId);
            })

            // Tinh tổng doanh thu của giảng viên trên tất cả các khóa học
            let totalRevenue = 0;

            relevantOrders.forEach(order => {
            // Lấy tổng giá khóa học của giảng viên trong đơn hàng
                const courseRevenue = order.courses
                    .filter(course => course.createdBy._id.toString() === teacherId)
                    .reduce((total, course) => total + course.price, 0);
                totalRevenue += courseRevenue;
            })

            // Tính doanh thu/số tiền thực tế mà giảng viên sẽ nhận được
            const actualRevenue = totalRevenue * 0.8; // Trừ 20% phí của nền tảng

            const user = await User.findById(teacherId);
            user.teacher.pendingEarning = totalRevenue;
            user.teacher.paidEarning = actualRevenue;
            await user.save();

            res.status(200).json({
                success: true,
                error: null,
                statusCode: 200,
                data: {
                    user: user,
                }
            });

        }
        catch (error) {
            console.log('error', error);
        }
    }

    

    
}

module.exports = new UserController