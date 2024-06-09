const express = require("express");
const router = express.Router();
const PaymentController = require("../app/controllers/PaymentController");

router.get("/vnpay_ipn", PaymentController.getResponseCode);
// Tổng doanh thu của toàn bộ hệ thống
router.get(
  "/total-revenue-system-day",
  PaymentController.totalRevenueSystemsByDay
);
router.get(
  "/total-revenue-system-month",
  PaymentController.totalRevenueSystemsByMonth
);
router.get(
  "/total-revenue-teacher-month",
  PaymentController.totalRevenueInstructorByMonth
);
router.get(
  "/total-revenue-system-year",
  PaymentController.totalRevenueSystemsByYear
);
router.get("/revenueCourseByDay/:id", PaymentController.revenueCourseByDay);
router.get("/revenueCourseByMonth/:id", PaymentController.revenueCourseByMonth);

router.post("/create_payment_url", PaymentController.createPaymentWithVNPAY);
router.post("/create_payment_momo", PaymentController.createPaymentWithMoMo);
router.post("/revenueCourseByTime", PaymentController.revenueCourseByTime);
router.post(
  "/revenueInstructorBymonth",
  PaymentController.reveneueInstructorByMonth
);

module.exports = router;
