const express = require("express");
const router = express.Router();
const CourseController = require("../app/controllers/CourseController");

router.get("/getAll", CourseController.getAllCourse);
router.get("/activate-course", CourseController.activateCourse);
router.get("/:courseId", CourseController.getCourseById);
router.get("/detail/:slug", CourseController.getCourseBySlug);

router.post("/create", CourseController.addCourse);
router.post("/filter", CourseController.filterCourse);
router.post("/:courseId/apply-discount", CourseController.applyDiscount);
router.post("/:courseId/add-part", CourseController.addPart);
router.post("/:courseId/add-lectures/:partId", CourseController.addLectures);
router.post("/:courseId/assignments", CourseController.addAssignment);

router.put(
  "/:courseId/assignments/:assignmentId/questions/:questionId",
  CourseController.updateAssignmentQuestion
);
router.put(
  "/:courseId/assignments/:assignmentId",
  CourseController.updateAssignment
);
router.put("/:courseId/reset-discount", CourseController.resetDiscount);
router.put("/:id", CourseController.updateCourse);
router.put("/:courseId/:partId/:lectureId", CourseController.updateLectures);
router.put("/:courseId/:partId", CourseController.updatePart);

router.delete("/:id", CourseController.deleteCourse);
router.delete(
  "/:courseId/assignments/:assignmentId/questions/:questionId",
  CourseController.deleteQuestion
);
router.delete(
  "/:courseId/assignments/:assignmentId",
  CourseController.deleteAssignment
);
router.delete("/:courseId/del-part/:partId", CourseController.deletePart);
router.delete("/:courseId/:partId/:lectureId", CourseController.deleteLectures);

module.exports = router;
