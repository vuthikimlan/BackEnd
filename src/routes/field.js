const express = require('express')
const router = express.Router()

const FieldController = require("../app/controllers/FieldController")

router.get('/getAll', FieldController.getAllField)
// router.get('/:id', FieldController.getByIdField)
router.get('/:slug', FieldController.getBySlug)

router.post('/create', FieldController.addField)
router.post('/filter', FieldController.filterField)
router.post('/:fieldId/add-topic', FieldController.addTopic)

router.put('/:id', FieldController.updateField)
router.put('/:fieldId/:topicId', FieldController.updateTopic)

router.delete('/:id', FieldController.delField)
router.delete('/:fieldId/:topicId', FieldController.delTopic)


module.exports = router