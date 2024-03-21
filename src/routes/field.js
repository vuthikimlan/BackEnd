const express = require('express')
const router = express.Router()

const FieldController = require("../app/controllers/FieldController")

router.get('/getAll', FieldController.getAllField)
router.get('/:id', FieldController.getByIdField)

router.post('/create', FieldController.addField)
router.post('/filter', FieldController.filterField)

router.put('/:id', FieldController.updateField)

// router.delete('/:id', FieldController.delBlog)


module.exports = router