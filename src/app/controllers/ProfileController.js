const { getIdUser } = require("../../service/getIdUser");
const Users = require("../models/Users");

class ProfileController {
  async profileUser(req, res) {
    try {
      const userId = getIdUser(req);
      const user = await Users.findById(userId)
        .populate("boughtCourses")
        .populate({
          path: "coursesPosted",
          select: "-createdBy -createdAt -updatedAt",
          populate: {
            path: "users",
            select: "name email phone",
          },
        })
        .populate({
          path: "coursesPosted",
          select: "-createdBy -createdAt -updatedAt",
          populate: {
            path: "field",
            select: "title",
          },
        })
        .populate({
          path: "order",
          select: "_id courses price totalPrice orderDate status ",
          populate: {
            path: "courses",
            select: " name ",
          },
        });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = getIdUser(req);

      // Update user profile
      const user = await Users.findByIdAndUpdate(userId, req.body, {
        new: true,
      });

      await user.save();

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Lỗi trong quá trình cập nhật" });
    }
  }
}

module.exports = new ProfileController();
