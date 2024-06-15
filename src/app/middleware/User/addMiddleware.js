const { body, check } = require("express-validator");
const Users = require("../../models/Users");
const bcrypt = require("bcrypt");

const addMiddleware = async (req, res, next) => {
  const { password } = req.body;
  await check("name")
    .notEmpty()
    .withMessage("Tên không được để trống")
    .isLength({ min: 6, max: 100 })
    .withMessage("Tên người dùng phải có ít nhất 6 ký tự, nhiều nhất 100 ký tự")
    .run(req),
    await body("username")
      .notEmpty()
      .withMessage("Username không được để trống")
      .isLength({ min: 6 })
      .withMessage("Username phải có ít nhất 6 ký tự")
      .custom(async (value) => {
        const existingUser = await Users.findOne({ username: value });
        if (existingUser) {
          throw new Error("Username đã tồn tại");
        }
      })
      .run(req),
    await body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .normalizeEmail()
      .run(req),
    await body("password")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage("Mật khẩu phải bao gồm 1 chữ hoa, 1 ký tự đặc biệt, và số")
      .run(req),
    await check("role")
      .notEmpty()
      .withMessage("Vai trò không được để trống")
      .run(req);
  if (password) {
    try {
      const hashedPass = await bcrypt.hash(password, parseInt("10"));
      req.body.password = hashedPass;
      next();
    } catch (error) {
      res.status(200).json({
        error: "Lỗi mã hóa mật khẩu",
      });
    }
  } else {
    next();
  }
};

module.exports = addMiddleware;
