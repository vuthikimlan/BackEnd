const { isValidObjectId } = require("mongoose");
const Discount = require("../models/Discount");
const nodeCron = require("node-cron");
const Course = require("../models/Course");

class DiscountController {
  async addDiscount(req, res) {
    try {
      const { expiryDate } = req.body;
      const expiry = Date.now() + expiryDate * 24 * 60 * 60 * 1000;
      const newDiscount = new Discount({
        ...req.body,
        expiryDate: expiry,
      });

      const saveDiscount = await newDiscount.save();

      res.status(200).json({
        data: saveDiscount,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAllDiscount(req, res) {
    const totalDiscount = await Discount.countDocuments();
    const items = await Discount.find({});

    res.status(200).json({
      success: true,
      error: null,
      statusCode: 200,
      data: {
        total: totalDiscount,
        items,
      },
    });
  }

  async updateStatus(req, res) {
    const expiriedDiscount = await Discount.find({
      expiryDate: { $lt: new Date() },
    });

    console.log("expiriedDiscount", expiriedDiscount);

    expiriedDiscount.forEach(async (coupon) => {
      coupon.active = false;
      await coupon.save();
      const courses = await Course.find({
        discountedCodeApplied: coupon.discountCode,
      });
      courses.forEach(async (course) => {
        course.discountedPrice = 0;
        course.discountedCodeApplied = "";
        await course.save();
      });
    });

    res.status(200).json({
      message: "Discount status updated successfully",
      success: true,
    });
  }

  async getByIdDiscount(req, res) {
    try {
      const id = req.params.id;

      if (isValidObjectId(id)) {
        const discount = await Discount.findById({ _id: id });
        res.status(200).json({
          success: true,
          error: null,
          statusCode: 200,
          data: discount,
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  }

  async updateDiscount(req, res) {
    try {
      if (req.body.expiryDate)
        req.body.expiryDate =
          Date.now() + +req.body.expiryDate * 24 * 60 * 60 * 1000;

      const updateDiscount = await Discount.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updateDiscount) {
        return res.status(404).json({
          message: "Không tìm thấy bản ghi",
          statusCode: 404,
          success: false,
        });
      }
      res.status(200).json({
        data: updateDiscount,
        error: null,
        statusCode: 200,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async delDiscount(req, res) {
    try {
      await Discount.deleteOne({ _id: req.params.id });
      res.status(200).json({
        message: "Xóa mã giảm giá thành công",
      });
    } catch (error) {
      // res.status(500).json(error)
      console.log(error);
    }
  }

  async filterDiscount(req, res) {
    try {
      const { discountCode, expiryDate, status } = req.body;
      let filter = {};

      if (discountCode)
        filter.discountCode = { $regex: new RegExp(discountCode, "i") };
      if (expiryDate)
        filter.expiryDate = { $regex: new RegExp(expiryDate, "i") };
      if (status) filter.status = { $regex: new RegExp(status, "i") };

      const result = await Discount.find(filter);
      const totalDiscount = await Discount.countDocuments(filter);

      res.json({
        success: true,
        error: null,
        statusCode: 200,
        data: {
          total: totalDiscount,
          items: result,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Có lỗi trong quá trình xử lý yêu cầu",
      });
    }
  }
}

module.exports = new DiscountController();
