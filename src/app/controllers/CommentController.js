const { default: mongoose } = require('mongoose');
const { getIdUser } = require('../../service/getIdUser');
const Comment = require('../models/Comment');
const Course = require('../models/Course');

class CommentController {
    async updateComment(req, res) {
        try {
            // Cần validate dữ liệu, người dùng khi đánh giá bắt buộc phải truyền 
            // Số sao và khóa học
            const userId = getIdUser(req)
            const {courseId} = req.params
            const {comment, star} = req.body

            const course = await Course.findById(courseId);

            let commentDoc  = await Comment.findOne({postedBy: userId, courses: courseId})
            let message;

            if(commentDoc ){
                // Cập nhật nội dung cho các comment đã tồn tại
                commentDoc .comment = comment
                commentDoc .star = star
            } 
            else {
                // Tạo mới comment nếu chưa tồn tại
                commentDoc = new Comment({
                    comment,
                    star,
                    postedBy: userId,
                    courses: courseId,
                })
            }
            await commentDoc.save()
            
            // Cập nhật rating của khóa học
            if(course) {
                // Them id cua danh gia vao mang rating cua khoa hoc
                course.ratings.push(commentDoc._id)
                await course.save()

                const [totalRating] = await Comment.aggregate([
                    {$match: {_id: {$in: course.ratings} }},
                    {$group: {_id: null, total: {$sum: "$star"} }}
                ])
                // Kiểm tra có phần tử ko
                // Nếu có thì lấy tổng số sao và chia cho số lượt đánh giá sau đó làm tròn 
                // Còn nếu ko có phần tử thì trả về là 0
                const totalRatings = totalRating[0].total / course.ratings.length || 0
                const userRatings = course.ratings.length
                
                course.totalRatings = totalRatings
                course.userRatings = userRatings
                await course.save()
            }

            if(commentDoc) {
                message = 'Cập nhật đánh giá thành công';
            } else {
                message = 'Tạo mới đánh giá thành công';
            }

            // Trả về kết quả
            res.status(200).json({
                success: true,
                message: message,
                data: commentDoc
            });

        } catch (error) {
            console.log("error", error)
            res.status(500).json({
                success: false,
                error: "Đã có lỗi xảy ra, vui lòng thử lại sau",
                statusCode: 500
            })
        }
    }
    

    async getAllComment(req, res) {
        const items = await Comment.find({}).populate('postedBy', 'name username').populate('courses', 'name price')
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                items
            }
        })
    }

    async delComment(req, res) {
        try {
            const userId = getIdUser(req)
            const {courseId, commentId} = req.params

            // Kiem tra nguoi dung co duoc xoa khong. Nguoi dung chi duoc xoa 
            // danh gia cua nguoi dung
            const comment = await Comment.findOne({_id: commentId, postedBy: userId})
            if(!comment) {
                return res.status(404).json({
                    success: false,
                    message: "Bạn không có quyền xóa đánh giá"
                })
            }

            // Xoa danh gia khoi Comment
            await Comment.findByIdAndDelete(commentId)
            // Xoa danh gia khoi ratings trong Course
            await Course.updateOne(
                {_id: courseId},
                {$pull: {ratings: commentId}}
            )

            res.status(200).json({
                success: true,
                message: "Xóa đánh giá thành công"
            })
            
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async filterComment(req, res) {
        try {
            const {comment} = req.body
            let filter = {}
            if(comment) filter.comment = {$regex: new RegExp(comment, 'i')}

            const result = await Comment.find(filter).populate('postedBy', 'name username').populate('courses', 'name price')
            const totalComment = await Comment.countDocuments(filter)

            res.status(200).json({
                success: true,
                error: null,
                statusCode: 200,
                data: {
                    total: totalComment,
                    items: result
                }
            })
        } catch (error) {
            
        }
    }

}

module.exports = new CommentController