const { validationResult } = require('express-validator')
const Course = require('../models/Course')
const User = require('../models/Users')
const { isValidObjectId } = require('mongoose')

class UserController {
    async addUser(req, res) {
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
            
            const newUser = new User(req.body)
    
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
        const totalStudent = await User.countDocuments()
        const items = await User.find({}).populate('courses')
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalStudent,
                items
            }
        })
    }

    async getUserById(req, res){
        const _id = req.params.id
        if(isValidObjectId(_id)) {
            const user = await User.findById({_id: _id}).populate('courses')
            
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
}

module.exports = new UserController