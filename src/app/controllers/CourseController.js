const { isValidObjectId, default: mongoose } = require("mongoose");
const Course = require("../models/Course");
const jwt = require("jsonwebtoken");
const { default: slugify } = require("slugify");
const Users = require("../models/Users");
const Discount = require("../models/Discount");
const Field = require("../models/Field");
const { default: getVideoDurationInSeconds } = require("get-video-duration");

class CourseController {
  async addCourse(req, res) {
    try {
      const { field, topic } = req.body;

      if (req.body && req.body.name) {
        req.body.slug = slugify(req.body.name);
      }
      //Khi tạo khóa học cần biết ai là người tạo khóa học
      // Khi người dùng đăng nhập thì sẽ  lấy thông tin của
      // người dùng và đưa vào trường createBy
      const token = req.headers?.authorization?.split(" ")[1];
      const userInfor = jwt.verify(token, "This is JWT");
      const userId = userInfor.data._id;
      const name = userInfor.data.name;
      const username = userInfor.data.username;

      const newCourseData = {
        ...req.body,
        field,
        topic,
        createdBy: {
          _id: userId,
          name: name,
          username: username,
        },
      };

      const newCourse = new Course(newCourseData);

      const saveCourse = await newCourse.save();

      // người dùng Khi tạo khóa học mới thì khóa học cx đc
      // Lưu vào trường khóa học mà người đó đã tạo
      const user = await Users.findById({ _id: userId });
      user.coursesPosted.push(saveCourse._id);
      await user.save();

      // Khi tạo thể loại mới thì thể loại đó cũng cần lưu lại khóa học đó
      await Field.findByIdAndUpdate(
        field, //Tim den the loai
        { $push: { "topics.$[topicId].courses": newCourse._id } },
        { arrayFilters: [{ "topicId._id": topic }] }
      );

      res.status(200).json({
        data: saveCourse,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async addPart(req, res) {
    try {
      const { courseId } = req.params;
      const { parts } = req.body;
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy khóa học",
        });
      }

      // Thêm từng phần học vào khóa học
      // Dùng for để lặp qua mỗi phần tử của parts[]
      for (const part of parts) {
        course.parts.push(part);
      }
      await course.save();

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async addLectures(req, res) {
    try {
      const { courseId, partId } = req.params;
      const { lectureName, video, document, descriptionLectures, isFree } =
        req.body;
      const course = await Course.findById(courseId);
      const part = course.parts.id(partId);
      const newLecture = {
        lectureName,
        // video,
        document,
        // duration,
        descriptionLectures,
        isFree,
      };

      if (video) {
        const timeLecture = await getVideoDurationInSeconds(video);
        const duration = Math.round((timeLecture / 60) * 100) / 100;
        newLecture.video = video;
        newLecture.duration = duration;
        part.lectures.push(newLecture);
        const newTotalTimeLectures = part.lectures.reduce(
          (total, currLecture) => total + currLecture.duration,
          0
        );
        part.totalTimeLectures = newTotalTimeLectures;
        part.totalLecturePart = part.lectures.length;

        const newTotalTime = course.parts.reduce((total, part) => {
          return total + part.totalTimeLectures;
        }, 0);

        course.totalTimeCourse += newTotalTime;
        course.totalLecture = course.parts.reduce((total, part) => {
          return total + part.totalLecturePart;
        }, 0);
      } else {
        part.lectures.push(newLecture);
      }
      await course.save();
      res.status(201).json({
        success: true,
        message: "Tạo bài giảng thành công",
        data: course,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAllCourse(req, res) {
    const totalCourse = await Course.countDocuments();
    const items = await Course.find({})
      .populate("users")
      .populate({
        path: "ratings",
        select: "star comment postedBy", // Chọn các trường cần hiển thị từ ratings
        populate: {
          path: "postedBy",
          select: "name username ", // Chọn các trường cần hiển thị từ user
        },
      })
      .populate("field", "title");

    res.status(200).json({
      success: true,
      error: null,
      statusCode: 200,
      data: {
        total: totalCourse,
        items,
      },
    });
  }

  async getCourseById(req, res) {
    try {
      const id = req.params.courseId;
      if (isValidObjectId(id)) {
        const course = await Course.findById({ _id: id })
          .populate("users")
          .populate({
            path: "ratings",
            select: "star comment postedBy updatedAt", // Chọn các trường cần hiển thị từ ratings
            populate: {
              path: "postedBy",
              select: "name username ", // Chọn các trường cần hiển thị từ user
            },
          })
          .populate("field", "title")
          .populate("users", "name email phone");

        res.status(200).json({
          success: true,
          error: null,
          statusCode: 200,
          data: course,
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  async getCourseBySlug(req, res) {
    try {
      const slug = req.params.slug;
      const course = await Course.findOne({ slug: slug })
        .populate("users")
        .populate({
          path: "ratings",
          select: "star comment postedBy updatedAt", // Chọn các trường cần hiển thị từ ratings
          populate: {
            path: "postedBy",
            select: "name username ", // Chọn các trường cần hiển thị từ user
          },
        })
        .populate("field", "title");

      res.status(200).json({
        success: true,
        error: null,
        statusCode: 200,
        data: course,
      });
      // }
    } catch (error) {
      console.log("error", error);
    }
  }

  async updateCourse(req, res) {
    try {
      if (req.body && req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateCourse = await Course.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updateCourse) {
        return res.status(404).json({
          message: "Không tìm thấy bản ghi",
          statusCode: 404,
          success: false,
        });
      }

      res.status(200).json({
        data: updateCourse,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updatePart(req, res) {
    const { courseId, partId } = req.params;

    const course = await Course.findById(courseId);
    const part = course?.parts.id(partId);
    if (!part) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy phần",
      });
    }
    Object.assign(part, req.body);
    await course.save();

    res.status(200).json({
      data: part,
      error: null,
      statusCode: 200,
      success: true,
    });
  }

  async updateLectures(req, res) {
    try {
      const { courseId, partId, lectureId } = req.params;
      const { video } = req.body;
      const course = await Course.findById(courseId);
      const part = course.parts.id(partId);
      const lecture = part.lectures.id(lectureId);

      const oldDuration = lecture.duration;
      const timeLecture = await getVideoDurationInSeconds(video);

      if (req.body.video) {
        const newDuration = Math.round((timeLecture / 60) * 100) / 100;
        lecture.duration = newDuration;
      }
      Object.assign(lecture, req.body);
      // Cập nhật lại thời lượng cho part
      part.totalTimeLectures -= oldDuration;
      part.totalTimeLectures += lecture.duration;
      part.totalLecturePart = part.lectures.length;

      const newTotalTime = course.parts.reduce((total, part) => {
        return total + part.totalTimeLectures;
      }, 0);
      course.totalTimeCourse = newTotalTime;
      course.totalLecture = course.parts.reduce((total, part) => {
        return total + part.totalLecturePart;
      }, 0);
      await course.save();

      res.status(200).json({
        data: course,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async deleteCourse(req, res) {
    try {
      await Course.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "Xóa khóa học thành công",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deletePart(req, res) {
    try {
      const { courseId, partId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy khóa học",
        });
      }
      // Tim phan trong khoa hoc
      const partInd = course.parts.findIndex(
        (part) => String(part._id) === partId
      );
      if (partInd === -1) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy phần",
        });
      }

      course.parts.splice(partInd, 1);
      await course.save();

      res.status(200).json({
        message: "Xóa phần thành công",
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async deleteLectures(req, res) {
    try {
      const { courseId, partId, lectureId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy khóa học",
        });
      }

      const part = course.parts.id(partId);
      if (!part) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phần học",
        });
      }

      const lectureInd = part.lectures.findIndex(
        (lecture) => lecture._id.toString() === lectureId
      );
      if (lectureInd === -1) {
        res.status(404).json({
          success: false,
          message: "Không tìm thấy bài giảng",
        });
      }

      part.lectures.splice(lectureInd, 1);

      await course.save();

      res.status(200).json({
        success: true,
        message: "Xóa bài giảng thành công",
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async filterCourse(req, res) {
    try {
      const { name, field, topic, level, minPrice, maxPrice } = req.body;
      let filter = {};

      if (name) filter.name = { $regex: new RegExp(name, "i") };
      // if (field) filter.field = { $regex: new RegExp(field, "i") };
      if (field) {
        const objectId = new mongoose.Types.ObjectId(field);
        filter.field = objectId.toString();
      }
      if (topic) {
        const objectId = new mongoose.Types.ObjectId(topic);
        filter.topic = objectId.toString();
      }
      if (level) filter.level = { $regex: new RegExp(level, "i") };
      // Để lọc các khóa học với giá tiền gần giá trị cụ thể, bạn nên sử dụng
      // các toán tử so sánh số như $lt (nhỏ hơn), $lte (nhỏ hơn hoặc bằng),
      //  $gt (lớn hơn), $gte (lớn hơn hoặc bằng)
      // if (price) filter.price = { $gte: parseInt(price) };
      if (minPrice && maxPrice) {
        filter.price = {
          $gte: minPrice,
          $lte: maxPrice,
        };
      }

      const result = await Course.find(filter).populate("field", "title");
      const totalCourse = await Course.countDocuments(filter);

      res.json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          total: totalCourse,
          items: result,
        },
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({
        error: "Có lỗi trong quá trình xử lý yêu cầu",
      });
    }
  }

  // Thêm mới bài tập
  async addAssignment(req, res) {
    try {
      const courseId = req.params.courseId;
      const assignmentData = req.body;

      const course = await Course.findById(courseId);

      // Check câu hỏi đã tồn tại hay chưa
      const existingAssignment = course.assignments.find(
        (assignment) =>
          assignment.nameAssignment === assignmentData.nameAssignment
      );
      if (existingAssignment) {
        return res
          .status(400)
          .json({ error: "Bài tập đã tồn tại trong khóa học này" });
      }

      const newAssignment = {
        nameAssignment: assignmentData.nameAssignment,
        descriptionAssignment: assignmentData.descriptionAssignment,
        dueDate: assignmentData.dueDate,
        questions: assignmentData.questions.map((question) => ({
          type: question.type,
          question: question.question,
          options: question.options || [],
          answer: question.answer || "",
        })),
      };

      course.assignments.push(newAssignment);
      await course.save();
      res.status(200).json({
        data: newAssignment,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  // Cập nhật bài tập hoặc thêm mới câu hỏi trong bài tập
  async updateAssignment(req, res) {
    try {
      const { courseId, assignmentId } = req.params;
      const updatedAssignmentData = req.body;

      const course = await Course.findById(courseId);
      const assignment = course.assignments.id(assignmentId);

      // Cập nhật thông tin bài tập
      assignment.nameAssignment =
        updatedAssignmentData.nameAssignment || assignment.nameAssignment;
      assignment.descriptionAssignment =
        updatedAssignmentData.descriptionAssignment ||
        assignment.descriptionAssignment;
      assignment.dueDate = updatedAssignmentData.dueDate || assignment.dueDate;

      // Thêm câu hỏi mới vào mảng questions
      if (updatedAssignmentData.questions) {
        for (const question of updatedAssignmentData.questions) {
          // Kiểm tra xem câu hỏi đã tồn tại hay chưa
          const existingQuestion = assignment.questions.some(
            (questions) => questions.question === question.question
          );
          if (existingQuestion) {
            return res.status(400).json({
              error: `Câu hỏi '${question.question}' đã tồn tại. Bạn có thể chỉnh sửa nó.`,
            });
          }
          assignment.questions.push({
            type: question.type,
            question: question.question,
            options: question.options || [],
            answer: question.answer || "",
          });
        }
      }
      await course.save();
      res.status(200).json({
        data: assignment,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  // Cập nhật nội dung option hoặc answer bên trong mỗi câu hỏi
  async updateAssignmentQuestion(req, res) {
    try {
      const { courseId, assignmentId, questionId } = req.params;
      const updatedQuestionData = req.body;
      const course = await Course.findById(courseId);
      const assignment = course.assignments.id(assignmentId);
      const question = assignment.questions.id(questionId);

      // Cập nhật thông tin câu hỏi
      question.type = updatedQuestionData.type || question.type;
      question.question = updatedQuestionData.question || question.question;
      question.options = updatedQuestionData.options || question.options;
      question.answer = updatedQuestionData.answer || question.answer;

      // Thêm option mới vào mảng options
      if (updatedQuestionData.newOption) {
        question.options.push({
          option: updatedQuestionData.newOption.option,
          isCorrect: updatedQuestionData.newOption.isCorrect || false,
        });
      }

      // Xóa option (nếu có)
      if (updatedQuestionData.removeOption) {
        question.options = question.options.filter(
          (option) => option.option !== updatedQuestionData.removeOption
        );
      }

      // Xóa answer (nếu có)
      if (updatedQuestionData.removeAnswer) {
        question.answer = "";
      }

      await course.save();

      res.status(200).json({
        data: assignment,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  //Xóa câu hỏi
  async deleteQuestion(req, res) {
    try {
      const { courseId, assignmentId, questionId } = req.params;
      const course = await Course.findById(courseId);
      const assignment = course.assignments.id(assignmentId);

      // Xóa câu hỏi khỏi mảng questions
      assignment.questions.pull(questionId);

      await course.save();

      res.status(200).json({
        data: assignment,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  // Xóa bài tập
  async deleteAssignment(req, res) {
    try {
      const { courseId, assignmentId } = req.params;
      const course = await Course.findById(courseId);
      const assignment = course.assignments.id(assignmentId);

      // Xóa bài tập khỏi mảng assignments
      course.assignments.pull(assignmentId);

      await course.save();

      res.status(200).json({
        data: assignment,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async applyDiscount(req, res) {
    try {
      const { courseId } = req.params;
      const { discountCode } = req.body;

      // Kiem tra ma giam gia co ton tai khong
      const existingDiscountCode = await Discount.findOne({ discountCode });
      if (!existingDiscountCode) {
        return res.status(400).json({
          message: "Mã giảm giá không tồn tại",
        });
      } else if (existingDiscountCode.expiryDate < new Date()) {
        return res.status(200).json({
          success: false,
          message: "Mã giảm giá đã hết hạn sử dụng",
        });
      }

      // Lấy thông tin khóa học
      const course = await Course.findById(courseId);
      // Ap dung ma giam gia cho khoa hoc
      course.discountedCodeApplied = discountCode;
      course.discountedPrice =
        course.price * (1 - existingDiscountCode.discountRate / 100);

      const discountCourse = await course.save();
      return res.status(200).json({
        success: true,
        data: discountCourse,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async resetDiscount(req, res) {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId);

      course.discountedPrice = null;
      course.discountedCodeApplied = null;

      const resetDiscount = await course.save();

      res.status(200).json({
        success: true,
        data: resetDiscount,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  // Kích hoạt khóa học sau khi mua thành công
  async activateCourse(req, res) {
    try {
      const userId = req.query.userId;
      const courseId = req.query.courseId;

      const activationDate = new Date();
      console.log("activationDate", activationDate);
      const expirationDate = new Date(
        activationDate.setFullYear(activationDate.getFullYear() + 1)
      );

      const course = await Course.findOne({
        _id: courseId,
        "enrollment.userId": userId,
      });
      const enrollment = course.enrollment.find(
        (enroll) =>
          enroll.userId.toString() === userId &&
          enroll.courseId.toString() === courseId
      );

      if (!enrollment) {
        return res.status(400).json({
          success: false,
          message: "Người dùng chưa ghi danh vào khóa học này",
        });
      }
      if (enrollment.isActivated) {
        return res.status(400).json({
          success: false,
          message: "Khóa học đã được kích hoạt",
        });
      }

      const updatedCourse = await Course.findOneAndUpdate(
        { _id: courseId, "enrollment._id": enrollment._id },
        {
          $set: {
            "enrollment.$.isActivated": true,
            "enrollment.$.activationDate": activationDate,
            "enrollment.$.expirationDate": expirationDate,
          },
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Khóa học đã được kích hoạt thành công",
        course: updatedCourse,
      });
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = new CourseController();
