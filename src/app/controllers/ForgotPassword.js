const nodemailer = require('nodemailer')
const User = require('../models/Users')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const transpoter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'lani02km2@gmail.com',
        pass: 'lghi dhvo dzxq lpxv',
    }
})


const forgotPassword = async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user) {
        return res.status(200).json({
            error: "Người dùng không tồn tại"
        })
    }

    const token = jwt.sign(
            {id: user._id }, 
            "This is JWT", 
            {expiresIn: '1h'}
        )
    user.resetPasswordToken = token
    // Token sẽ hết hạn sau 1h
    user.resetPasswordTokenExpirse = Date.now() + 3600000

    await user.save();

    // Link này khi click vào sẽ dẫn đến một trang web khác --> đường dẫn sẽ thay bằng đường
    // dẫn của FE. Trong trang web đó chứa biểu mẫu dùng để đặt lại pass
    const resetUrl = `http://${req.headers.host}/reset-password?token=${token}`

    const mailOptions = {
        from: 'E-learning',
        to: user.email,
        subject: 'Đặt lại mật khẩu',
        html: `
        <div>
            <p>Chào bạn! <br/>
                Bạn đã gửi yêu cầu đặt lại mật khẩu của bạn <br/>
                Vui lòng click vào link dưới đây để đặt lại mật khẩu.
                <a href="${resetUrl}" >Đặt lại mật khẩu</a>
                
            </p>

        </div> 
        `
    }

    try {
        await transpoter.sendMail(mailOptions)
        res.json({
            message: "Vui lòng kiểm tra email"
        })
    } catch (error) {
        res.status(500).json({
            error: "Có lỗi trong quá trình gửi lại mật khẩu"
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const {token, newPassword, confirmPassword} = req.body

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

        // Kiểm tra mật khẩu mới và mật khẩu cũ
        if(newPassword !== confirmPassword) {
            res.status(400).json({
                message: "Mật khẩu không khớp"
            })
        }

        // lấy id từ token của người dùng
        const decoded = jwt.verify(token, "This is JWT")
        const userId = decoded.id

        // Kiểm tra người dùng có tồn tại không
        const user = await User.findById(userId)
        if(!user) {
            res.status(401).json({
                message: "Người dùng không tồn tại"
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, parseInt("10"))

        user.password = hashedPassword
        user.resetPasswordToken = undefined,
        user.resetPasswordTokenExpirse = undefined
        await user.save()

        res.status(200).json({
            message: "Đặt lại mật khẩu thành công"
        })
    } catch (error) {
        res.status(500).json({
            message: "Có lỗi trong quá trình đặt lại mật khẩu"
        })
    }
}



module.exports = {
    forgotPassword,
    resetPassword
}