const { isValidObjectId } = require('mongoose')
const Field = require('../models/Field')
const { default: slugify } = require('slugify')

class FieldController {
    async addField(req, res) {
        try {
            const { title,  image } = req.body
            
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

    async addTopic(req, res) {
        try {
            const {fieldId } = req.params
            const {topics} = req.body
            const field = await Field.findById(fieldId)

            for(const topic of topics) {
                const newTopic = {
                    ...topic,
                    slug: slugify(topic.nameTopic)
                }
                field.topics.push(newTopic)
                // console.log('topic', topic);
            }
            await field.save()

            res.status(200).json({
                success: true,
                data: field
            })

        } catch (error) {
            console.log('error', error);
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

    async getBySlug(req, res) {
        try {
            const slug = req.params.slug
            const field = await Field.findOne({ slug: slug}).populate('topics.courses')
            res.status(200).json({
                success:true,
                error:null,
                statusCode: 200,
                data: field
            })

        } catch (error) {
            console.log('error', error);
        }
    }

    async getTopicBySlug(req, res) {
        try {
            const {slugField, slugTopic } = req.params
            const field = await Field.findOne({ slug: slugField}).populate({
                path: 'topics',
                match: { slug: slugTopic },
                populate: { path: 'courses' }
            });
            // Không thể dùng trực tiếp populate ở topic vì Mongoose không hỗ trợ gọi phương thức populate() trực tiếp trên các tài liệu lồng nhau
            const topic = field.topics.find(topic => topic.slug === slugTopic)
            res.status(200).json({
                success:true,
                error:null,
                statusCode: 200,
                data: topic
            })

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

    async updateTopic(req, res) {
        try {
            const {fieldId, topicId} = req.params
            const field = await Field.findById(fieldId)
            const topic = field?.topics.id(topicId)
           
            if(req.body.nameTopic) {
                topic.slug = slugify(req.body.nameTopic) 
            }
            Object.assign(topic, req.body)
            await field.save()
    
            res.status(200).json({
                data: topic,
                error: null,
                statusCode: 200,
                success: true
            })
            
        } catch (error) {
            console.log(error);
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

    async delTopic(req, res) {
        try {
            const {fieldId, topicId} = req.params
            const field = await Field.findById(fieldId)
            
            const topicInd = field.topics.findIndex(topic => String(topic._id) === topicId )
            if(topicInd === -1) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy chủ đề"
                })
            }

            field.topics.splice(topicInd, 1)
            await field.save()

            res.status(200).json({
                message:"Xóa chủ đề thành công"
            })

        } catch (error) {
            console.log('error', error);
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