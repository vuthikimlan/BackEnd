const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const {
  Types: { ObjectId },
} = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/Users");
const { isValidObjectId } = require("mongoose");
const { getIdUser } = require("../../service/getIdUser");
const Order = require("../models/Order");
const ProgressTracker = require("../models/ProgressTracker");

class UserController {
  async addUser(req, res) {
    try {
      const {
        specialization,
        experience,
        facebook,
        pendingEarning,
        paidEarning,
        accountNumber,
        accountName,
        bankCode,
      } = req.body;

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

      const newUserData = {
        ...req.body,
        teacher: {
          specialization: specialization,
          experience: experience,
          facebook: facebook,
          pendingEarning: pendingEarning,
          paidEarning: paidEarning,
        },
        paymentMethod: {
          accountNumber: accountNumber,
          accountName: accountName,
          bankCode: bankCode,
        },
      };

      const newUser = new User(newUserData);

      const courses = await Course.find({ _id: { $in: req.body.courses } });

      newUser.courses = courses;

      const savedUser = await newUser.save();

      await Promise.all(
        courses.map((course) => {
          course.users.push(savedUser._id);
          return course.save();
        })
      );

      res.status(200).json({
        data: savedUser,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAllUser(req, res) {
    const totalUser = await User.countDocuments();
    const items = await User.find({})
      .populate("boughtCourses")
      .populate("coursesPosted", "-createdBy ")
      // .populate('order', "_id courses totalPrice")
      .populate({
        path: "order",
        select: "_id courses totalPrice status ",
        populate: {
          path: "courses",
          select: " name discountedPrice price  ",
          // -image -createdAt -updatedAt -conditionParticipate -object
        },
      });
    res.status(200).json({
      success: true,
      error: null,
      statusCode: 200,
      data: {
        total: totalUser,
        items,
      },
    });
  }

  // const teacherId = req.params.teacherId
  async studentofTecher(req, res) {
    try {
      const teacherId = getIdUser(req);
      const user = await User.findById(teacherId);

      let students = [];

      // query 1 lần duy nhất để lấy thông tin các khóa học
      const courses = await Course.find({
        _id: { $in: user.coursesPosted },
      }).populate("users", "name email phone ");

      // Duyệt qua courses lấy danh sách học viên và gán vào mảng
      for (const course of courses) {
        students.push(...course.users);
      }
      const totalStudent = students.length;

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          totalStudent,
          students,
        },
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({
        error: "An error occurred while fetching student-teacher data.",
      });
    }
  }

  async getUserById(req, res) {
    const _id = req.params.id;
    if (isValidObjectId(_id)) {
      const user = await User.findById({ _id: _id })
        .populate({
          path: "boughtCourses",
          populate: { path: "field", select: "title" },
        })
        .populate({
          path: "coursesPosted",
          select: "-createdBy",
          populate: { path: "field", select: "title" },
        })
        .populate({
          path: "order",
          select: "_id courses totalPrice status ",
          populate: {
            path: "courses",
            select: " name discountedPrice price  ",
            // -image -createdAt -updatedAt -conditionParticipate -object
          },
        });
      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: user,
      });
    } else {
      res.status(200).json({
        error: "Định dạng của _id không hợp lệ",
      });
    }
  }

  async updateUser(req, res) {
    try {
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

      const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updateUser) {
        return res.status(404).json({
          message: "Không tìm thấy bản ghi",
          statusCode: 404,
          success: false,
        });
      }
      res.status(200).json({
        data: updateUser,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteUser(req, res) {
    try {
      await User.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "Xóa người dùng thành công",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async filterUser(req, res) {
    try {
      const { name, username, email, accountNumber, accountName, role } =
        req.body;
      let filter = {};

      // So sánh không bằng nhau, có thể tìm với bất kỳ ký tự là viết hoa hay ko
      if (name) filter.name = { $regex: new RegExp(name, "i") };
      if (username) filter.username = { $regex: new RegExp(username, "i") };
      if (email) filter.email = { $regex: new RegExp(email, "i") };
      if (accountNumber)
        filter.accountNumber = { $regex: new RegExp(accountNumber, "i") };
      if (accountName)
        filter.accountName = { $regex: new RegExp(accountName, "i") };
      if (role) filter.role = { $regex: new RegExp(role, "i") };

      const result = await User.find(filter);
      const totalUser = await User.countDocuments(filter);
      res.json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          total: totalUser,
          items: result,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Có lỗi trong quá trình xử lý yêu cầu",
      });
    }
  }

  async addToCart(req, res) {
    try {
      const { courseId } = req.params;
      const userId = getIdUser(req);
      const user = await User.findById(userId);
      let countCourses = 0;

      const existingCourse = user?.shoppingCart?.find(
        (item) => item.courseId.toString() === courseId
      );

      if (existingCourse) {
        return res.status(201).json({
          message: "Khóa học đã tồn tại trong giỏ hàng",
        });
      }

      const newCartItem = { courseId };
      user.shoppingCart.push(newCartItem);
      // Cập nhật số lượng khóa học trong giỏ hàng khi thêm mới
      countCourses = user.shoppingCart.length;
      user.countCourseCart = countCourses;

      await user.save();

      res.status(200).json({
        message: "Thêm vào giỏ hàng thành công",
        data: {
          countCourse: countCourses,
          items: user.shoppingCart,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async getCarts(req, res) {
    try {
      const userId = getIdUser(req);
      const user = await User.findById(userId)
        .select("shoppingCart")
        .populate("shoppingCart.courseId", "name image price")
        .populate({
          path: "shoppingCart.courseId",
          select:
            "name image price createdBy discountedCodeApplied discountedPrice totalLecture level totalRatings totalTimeCourse userRatings",
          populate: {
            path: "createdBy",
            select: "name username ", // Chọn các trường cần hiển thị từ user
          },
        });
      const countCourse = user.shoppingCart.length;

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          count: countCourse,
          items: user,
        },
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteCart(req, res) {
    try {
      const { courseId } = req.params;
      const userId = getIdUser(req);
      const user = await User.findById(userId);

      let countCourses = 0;

      //Kiểm tra giỏ hàng của người dùng có tồn tại không
      if (!user.shoppingCart || user.shoppingCart === 0) {
        return res.status(200).json({
          message: "Giỏ hàng trống",
        });
      }

      //duyệt qua các khóa học trong giỏ hàng và xóa khóa học có id trùng với courseId
      user.shoppingCart = user.shoppingCart.filter(
        (item) => item.courseId.toString() != courseId
      );
      //Cập nhật số lượng khóa học sau khi xóa
      countCourses = user.shoppingCart.length;
      user.countCourseCart = countCourses;

      await user.save();

      res.status(200).json({
        message: "Xóa khóa học khỏi giỏ hàng thành công",
        data: user,
      });
    } catch (error) {}
  }

  async revenueTeacher(req, res) {
    try {
      const teacherId = req.params.teacherId;
      let totalRevenue = 0;
      let revenue = 0;

      const order = await Order.find({ status: "completed" })
        .populate("courses")
        .populate({
          path: "courses.createdBy",
          select: "_id",
        });

      order.forEach((order) => {
        // Lay khoa hoc cua tung don hang
        const courses = order.courses;

        // Loc ra khoa hoc cua giang vien
        const teacherCourses = courses.filter((course) => {
          return course.createdBy._id.toString() === teacherId;
        });

        // Loc ra khoa hoc tron truong price
        const revenueCourses = order.price.filter((course) =>
          teacherCourses.some((c) => c._id.equals(course.courseId))
        );

        // Tinh doanh thu mỗi đơn hàng
        revenueCourses.forEach((course) => {
          revenue += course.price;
        });

        totalRevenue += revenue;
      });

      // Tính doanh thu/số tiền thực tế mà giảng viên sẽ nhận được
      const actualRevenue = totalRevenue * 0.8; // Trừ 20% phí của nền tảng

      const user = await User.findById(teacherId);
      user.teacher.pendingEarning = totalRevenue;
      user.teacher.paidEarning = actualRevenue;
      await user.save();

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          user: user,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async revenueOfInstructor(req, res) {
    try {
      const teacherId = getIdUser(req);
      let totalRevenue = 0;
      let revenue = 0;

      const order = await Order.find({ status: "completed" })
        .populate("courses")
        .populate({
          path: "courses.createdBy",
          select: "_id",
        });

      order.forEach((order) => {
        // Lay khoa hoc cua tung don hang
        const courses = order.courses;

        // Loc ra khoa hoc cua giang vien
        const teacherCourses = courses.filter((course) => {
          return course.createdBy._id.toString() === teacherId;
        });

        // Loc ra khoa hoc trong truong price
        const revenueCourses = order.price.filter((course) =>
          teacherCourses.some((c) => c._id.equals(course.courseId))
        );

        // Tinh doanh thu mỗi đơn hàng
        revenueCourses.forEach((course) => {
          revenue += course.price;
        });

        totalRevenue += revenue;
      });

      // Tính doanh thu/số tiền thực tế mà giảng viên sẽ nhận được
      const actualRevenue = totalRevenue * 0.8; // Trừ 20% phí của nền tảng

      const user = await User.findById(teacherId);
      user.teacher.pendingEarning = totalRevenue;
      user.teacher.paidEarning = actualRevenue;
      await user.save();

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          user: user,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async reveneueInstructorByMonth(req, res) {
    try {
      const teacherId = getIdUser(req);
      let revenue = 0;
      let result = [];
      const revenueByMonth = {
        month: "",
        pendingEarning: 0,
        costDeduction: 0,
        paidEarning: 0,
      };
      const orders = await Order.find({
        status: "completed",
      }).populate({
        path: "courses",
        select: "createdBy _id name image price discountedPrice",
        populate: {
          path: "createdBy",
          select: "_id",
        },
      });

      for (let order of orders) {
        const month = order.orderDate.toLocaleDateString("en-GB", {
          month: "2-digit",
          year: "numeric",
        });

        const courses = order.courses;
        const teacherCourses = courses.filter((course) => {
          return course.createdBy._id.toString() === teacherId;
        });
        const revenueCourses = order.price.filter((course) =>
          teacherCourses.some((c) => c._id.equals(course.courseId))
        );

        revenueCourses.forEach((course) => {
          revenue += course.price;
        });
        revenueByMonth.month = month;
        revenueByMonth.pendingEarning = revenue;
        revenueByMonth.paidEarning = revenue * 0.8;
        revenueByMonth.costDeduction = revenue * 0.2;
      }
      revenue = 0;
      result.push(revenueByMonth);

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async progressTracker(req, res) {
    try {
      const userId = getIdUser(req);
      const { courseId, lectureId } = req.params;
      const { completed } = req.body;

      // Tim va cap nhat tien do hoc
      let progressTracker = await ProgressTracker.findOne({
        userId: userId,
        courseId: courseId,
      });
      if (!progressTracker) {
        progressTracker = new ProgressTracker({
          userId: userId,
          courseId: courseId,
          completedLectures: [],
        });
      }
      const existingLectures = progressTracker.completedLectures.find((l) =>
        l.lectureId.equals(lectureId)
      );

      if (existingLectures) {
        existingLectures.completed = completed;
        existingLectures.completedAt = new Date();
      } else {
        progressTracker.completedLectures.push({
          lectureId: lectureId,
          completed: completed,
          completedAt: new Date(),
        });
      }
      await progressTracker.save();
      res.status(200).json({
        success: true,
        message: "Progress updated successfully",
        error: null,
        statusCode: 200,
        data: progressTracker,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getProgressTracker(req, res) {
    try {
      const userId = getIdUser(req);
      const courseId = req.params.courseId;
      const course = await Course.findById(courseId);
      const totalLectures = course.parts.reduce(
        (total, part) => total + part.lectures.length,
        0
      );

      // Thong tin tien do hoc cua nguoi dung
      const progress = await ProgressTracker.findOne({
        userId: userId,
        courseId: course._id,
      });

      const completedLectures = progress
        ? progress.completedLectures.filter((l) => l.completed).length
        : 0;

      //  Tinh phan tram tien do
      const progressPercentage = Math.round(
        (completedLectures / totalLectures) * 100
      );
      res.status(200).json({
        success: true,
        message: "Progress updated successfully",
        error: null,
        statusCode: 200,
        data: {
          progressPercentage,
          completedLectures: progress.completedLectures,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new UserController();
