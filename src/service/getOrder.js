const Order = require("../app/models/Order");

const getOrders = Order.find({
  status: "completed",
}).populate({
  path: "courses",
  select: "createdBy _id name image price discountedPrice",
  populate: {
    path: "createdBy",
    select: "_id",
  },
});

module.exports = {
  getOrders,
};
