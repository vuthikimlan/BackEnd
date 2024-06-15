const express = require("express");
const router = express.Router();
const AuthController = require("../app/controllers/auth");
const addMiddleware = require("../app/middleware/User/addMiddleware");

router.post("/login", AuthController.login);
router.post("/register", addMiddleware, AuthController.register);

module.exports = router;
