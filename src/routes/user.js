const express = require("express");
const router = express.Router();
const UserController = require("../app/controllers/UserController");
const addMiddleware = require("../app/middleware/User/addMiddleware");
const updateMiddleware = require("../app/middleware/User/updateMiddleware");

router.get("/getAll", UserController.getAllUser);
router.get("/student", UserController.studentofTecher);
router.get("/revenue-instructor", UserController.revenueOfInstructor);

router.get("/:id", UserController.getUserById);
router.get("/cart/getAll", UserController.getCarts);

router.get("/:teacherId/sales", UserController.revenueTeacher);
router.get("/progress-user/:courseId", UserController.getProgressTracker);
router.get(
  "/progress/:userId/:courseId",
  UserController.getProgressTrackerUser
);

router.post("/create", addMiddleware, UserController.addUser);
router.post("/filter", UserController.filterUser);
router.post("/addCart/:courseId", UserController.addToCart);
router.post(
  "/reveneueInstructorByMonth",
  UserController.reveneueInstructorByMonth
);

router.put("/:id", updateMiddleware, UserController.updateUser);
router.put("/progress/:courseId/:lectureId", UserController.progressTracker);

router.delete("/:id", UserController.deleteUser);
router.delete("/cart/:courseId", UserController.deleteCart);

module.exports = router;
