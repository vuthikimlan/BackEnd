const express = require('express')
const upload = require("../service/upload")
const { uploadFile } = require('../app/controllers/UploadController')
const router = express.Router()

router.post("/upload", upload.single('file'), uploadFile)

module.exports = router