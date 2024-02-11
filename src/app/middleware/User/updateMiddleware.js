const { body, check } = require("express-validator");
const Users = require("../../models/Users");


const updateMiddleware = async (req, res, next) => {
    await check("name")
            .notEmpty()
            .withMessage("Tên không được để trống")
            .isLength({min: 6, max: 100})
            .withMessage("Tên người dùng phải có ít nhất 6 ký tự, nhiều nhất 100 ký tự")
            .run(req),
    await body("username")
            .notEmpty()
            .withMessage("Username không được để trống")
            .isLength({min: 6})
            .withMessage("Username phải có ít nhất 6 ký tự")
            .run(req),
    await body("email")
            .isEmail()
            .withMessage("Email không hợp lệ")
            .normalizeEmail()
            .run(req),
    await check("role")
            .notEmpty()
            .withMessage("Vai trò không được để trống")
            .run(req);
    next()
};

module.exports = updateMiddleware