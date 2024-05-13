const { default: mongoose } = require("mongoose");
const { getIdUser } = require("../../service/getIdUser");
const Comment = require("../models/Comment");
const Course = require("../models/Course");
// const { mapChildComments } = require("../../service/comment");

class CommentController {
  async updateComment(req, res) {
    try {
      // Cần validate dữ liệu, người dùng khi đánh giá bắt buộc phải truyền
      // Số sao và khóa học
      const userId = getIdUser(req);
      const { courseId } = req.params;
      const { comment, star } = req.body;

      const course = await Course.findById(courseId);

      let commentDoc = await Comment.findOne({
        postedBy: userId,
        courses: courseId,
      });
      let message;

      if (commentDoc) {
        // Cập nhật nội dung cho các comment đã tồn tại
        commentDoc.comment = comment;
        commentDoc.star = star;
        message = "Cập nhật đánh giá thành công";
      } else {
        // Tạo mới comment nếu chưa tồn tại
        commentDoc = new Comment({
          comment,
          star,
          postedBy: userId,
          courses: courseId,
        });
        message = "Tạo mới đánh giá thành công";
        // Them id cua danh gia vao mang rating cua khoa hoc
        course.ratings.push(commentDoc._id);
      }
      await commentDoc.save();

      // Cập nhật rating của khóa học

      const totalRating = await Comment.aggregate([
        { $match: { _id: { $in: course.ratings } } },
        { $group: { _id: null, total: { $sum: "$star" } } },
      ]);
      // Kiểm tra có phần tử ko
      // Nếu có thì lấy tổng số sao và chia cho số lượt đánh giá sau đó làm tròn
      // Còn nếu ko có phần tử thì trả về là 0
      const totalRatings = totalRating[0].total / course.ratings.length || 0;
      const userRatings = course.ratings.length;

      course.totalRatings = totalRatings;
      course.userRatings = userRatings;
      await course.save();

      // Trả về kết quả
      res.status(200).json({
        success: true,
        message: message,
        data: commentDoc,
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({
        success: false,
        error: "Đã có lỗi xảy ra, vui lòng thử lại sau",
        statusCode: 500,
      });
    }
  }

  // Tạo phản hồi mới
  async createReply(req, res) {
    try {
      const userId = getIdUser(req);
      const { commentId } = req.params;
      const { content } = req.body;
      let message;

      const reply = {
        content,
        commentId,
        postedBy: userId,
      };
      // Kiểm tra existing reply
      let existingReply = await Comment.findOne({
        _id: commentId,
        "reply.commentId": reply.commentId,
      });

      if (existingReply) {
        // Reply đã tồn tại, chỉ cho phép update
        // Update reply trong comment
        await Comment.updateOne(
          { _id: commentId, "reply.commentId": reply.commentId },
          {
            "reply.content": reply.content,
          }
        );
        message = "Cập nhật đánh giá thành công";
      } else {
        // Tạo mới reply
        await Comment.updateOne(
          { _id: commentId },
          {
            reply: reply,
          }
        );
        message = "Tạo mới đánh giá thành công";
      }

      res.status(200).json({
        success: true,
        message: message,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async getCourseComments(req, res) {
    try {
      // Lấy courseId từ params
      const { courseId } = req.params;
      // Tìm course theo id
      const comments = await Comment.find({
        courses: courseId,
      })
        .populate("postedBy", "name username")
        .populate({
          path: "reply",
          select: "content postedBy",
          populate: {
            path: "postedBy",
            select: "name username ",
          },
        });

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        comments,
      });
    } catch (err) {
      // console.error(err);
      res.status(500).send("Server error");
    }
  }

  async getAllComment(req, res) {
    const comments = await Comment.find({})
      .populate("postedBy", "name username")
      .populate("courses", "name price");

    res.status(200).json({
      success: true,
      error: null,
      statusCode: 200,
      data: {
        comments,
      },
    });
  }

  async delComment(req, res) {
    try {
      const userId = getIdUser(req);
      const { courseId, commentId } = req.params;

      // Kiem tra nguoi dung co duoc xoa khong. Nguoi dung chi duoc xoa
      // danh gia cua nguoi dung
      const comment = await Comment.findOne({
        _id: commentId,
        postedBy: userId,
      });
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Bạn không có quyền xóa đánh giá",
        });
      }

      // Xoa danh gia khoi Comment
      await Comment.findByIdAndDelete(commentId);
      // Xoa danh gia khoi ratings trong Course
      await Course.updateOne(
        { _id: courseId },
        { $pull: { ratings: commentId } }
      );

      res.status(200).json({
        success: true,
        message: "Xóa đánh giá thành công",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async filterComment(req, res) {
    try {
      const { comment } = req.body;
      let filter = {};
      if (comment) filter.comment = { $regex: new RegExp(comment, "i") };

      const result = await Comment.find(filter)
        .populate("postedBy", "name username")
        .populate("courses", "name price");
      const totalComment = await Comment.countDocuments(filter);

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          total: totalComment,
          items: result,
        },
      });
    } catch (error) {}
  }
}

module.exports = new CommentController();
