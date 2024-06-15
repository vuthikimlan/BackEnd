const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;
    try {
      // Kiểm tra xem tài khoản đó có tồn tại hay không
      const existingUser = await Users.findOne({ username });
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(500).json({
          error: {
            errorList: errors.array(),
            message: "Tham số không hợp lệ",
            statusCode: 2,
            success: false,
          },
        });
      }

      if (existingUser) {
        const isMatched = bcrypt.compare(password, existingUser.password);
        if (isMatched) {
          const data = {
            _id: existingUser._id,
            name: existingUser.name,
            username: existingUser.username,
            role: existingUser.role,
          };

          let token = jwt.sign(
            {
              data: data,
            },
            "This is JWT",
            {
              expiresIn: "3h",
            }
          );

          res.status(200).json({
            success: true,
            error: null,
            data: {
              ...existingUser.toObject(),
              // password: "not show",
              token: token,
            },
          });
        }
      } else {
        res.status(200).json({
          success: false,
          error: {
            message: "Sai username hoặc password",
          },
        });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async register(req, res) {
    try {
      const { name, username, email, password, role } = req.body;

      // validate dữ liệu
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(200).json({
          error: {
            errorList: errors.array(),
            message: "Tham số không hợp lệ",
            statusCode: 2,
            success: false,
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, parseInt("10"));
      const newUser = new Users({
        name: name,
        username: username,
        email: email,
        password: hashedPassword,
        role: role,
      });

      const savedUser = await newUser.save();

      res.status(200).json({
        data: savedUser,
        message: "Đăng ký thành công",
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        message: error.errors,
      });
    }
  }
}

module.exports = new AuthController();
