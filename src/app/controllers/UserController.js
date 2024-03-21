const { validationResult } = require('express-validator')
const Course = require('../models/Course')
const User = require('../models/Users')
const { isValidObjectId } = require('mongoose')
const { getIdUser } = require('../../service/getIdUser')

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
        .populate('courses')
        .populate('coursesPosted', "-createdBy ")
        .populate('order', "orderId totalPrice")
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

    async getUserById(req, res){
        const _id = req.params.id
        if(isValidObjectId(_id)) {
            const user = await User.findById({_id: _id}).populate('courses').populate('coursesPosted', "-createdBy")
            
            res.status(200).json({
                success: true,
                error:null,
                statusCode: 200,
                data: user
            })
        } else {
            res.status(200).json({
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
            const {courseId} = req.body
            const userId = getIdUser(req)
            const user = await User.findById(userId)

            const existingCourse = user?.shoppingCart?.find(item => item.courseId.toString() === courseId)

            if(existingCourse) {
                return res.status(201).json({
                    message: "Khóa học đã tồn tại trong giỏ hàng"
                })
            } else {
                const newCartItem = {
                    courseId: courseId,
                }
                user.shoppingCart.push(newCartItem)
            }
            await user.save()

            res.status(200).json({
                message: "Thêm vào giỏ hàng thành công",
                data: user.shoppingCart
            })
            
        } catch (error) {
            console.log('error', error);
        }

    }

    async getCart (req, res) {
        try {
            const userId = req.params.id
            const user = await User.findById(userId).select('shoppingCart').populate('shoppingCart.courseId', 'name image price')
    
           res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: user
           })
        }
        catch (error) {
            res.status(500).json(error)
        }
    }

    async deleteCart (req, res) {
        try {
            const {courseId} = req.body
            const userId = getIdUser(req)
            const user = await User.findById(userId)

            //Kiểm tra giỏ hàng của người dùng có tồn tại không
            if(!user.shoppingCart || user.shoppingCart === 0) {
                return res.status(200).json({
                    message: "Giỏ hàng trống"
                })
            }

            user.shoppingCart = user.shoppingCart.filter(item => item.courseId.toString() != courseId)
            
            await user.save()

            res.status(200).json({
                message: "Xóa khóa học khỏi giỏ hàng thành công"
            })
            
        } catch (error) {
            
        }
    }

    
}

module.exports = new UserController