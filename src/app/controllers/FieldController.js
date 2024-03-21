const { isValidObjectId } = require('mongoose')
const Field = require('../models/Field')
const { default: slugify } = require('slugify')

class FieldController {
    async addField(req, res) {
        try {
            const { title, topics, image } = req.body
            
            const existingTitle = await Field.findOne({title})

            if(existingTitle) {
                res.status(400).json({
                    message: "Tên lĩnh vực đã tồn tại"
                })
            }

            const newFieldData = {
                title,
                image,
                slug: slugify(title),
                topics,
            }
            const newField = new Field(newFieldData)
            const saveField = await newField.save()
            res.status(200).json({
                data: saveField,
                error: null,
                statusCode: 200,
                success: true,
            })
            
        } catch (error) {
            console.log("error", error)
        }

    }

    async getAllField(req, res) {
        const totalField = await Field.countDocuments()

        const items = await Field.find({}).populate({
            path: "topics.courses",
            model: 'Course'
        })
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalField,
                items
            }
        })
    }

    async getByIdField(req, res) {
        try {
            const id = req.params.id

            if(isValidObjectId(id)) {
                const field = await Field.findById({_id: id})
                res.status(200).json({
                    success:true,
                    error:null,
                    statusCode: 200,
                    data: field
                })

            }
        } catch (error) {
            console.log('error', error);
        }
    }

    async updateField(req, res) {
        try {
           
            const updateField = await Field.findByIdAndUpdate(req.params.id, req.body, {new: true})

            if(!updateField) {
                return res.status(404).json({
                    message: "Không tìm thấy bản ghi",
                    statusCode: 404,
                    success: false
                })
            }
            res.status(200).json({
                data: updateField,
                error: null,
                statusCode: 200,
                success: true
            })
        } catch (error) {
        //    res.status(500).json(error) 
        console.log('error', error);

        }
    }

    async delField(req, res) {
        try {
            await Field.deleteOne({_id: req.params.id})
            res.status(200).json({
                message: "Xóa thể loại thành công"
            })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async filterField(req, res) {
        try {
            const {title, nameTopic} = req.body
            let filter = {}

            if(title) filter.title = {$regex: new RegExp(title, 'i')}
            if (nameTopic) {
                filter['topics.nameTopic'] = { $regex: new RegExp(nameTopic, 'i') };
            }
            
            const result = await Field.find(filter)
            const totalField = await Field.countDocuments(filter)

            res.json(
                {
                    success: true,
                    error: null,
                    statusCode: 200,
                    data: {
                        total: totalField,
                        items: result
                    }
                }
            )

        } catch (error) {
            res.status(500).json({
                error: 'Có lỗi trong quá trình xử lý yêu cầu'
            })
        }
    }

}

module.exports = new FieldController