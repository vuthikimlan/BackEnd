const { body } = require("express-validator");

const resetPassMiddleware = async (req, res, next) => {
    await body("newPassword")
            .isLength({min: 6})
            .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
            .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
            .withMessage("Mật khẩu phải bao gồm 1 chữ hoa, 1 ký tự đặc biệt, và số")
            .run(req)
    next()
}

module.exports = resetPassMiddleware;