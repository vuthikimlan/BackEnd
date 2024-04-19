const Discount = require("../models/Discount");
const Course = require("../models/Course");
const cron = require('node-cron');

const updateStatusDiscount =  (req, res, next) => {
    try {
        cron.schedule('0 0 * * *', async () => {

            const expiriedDiscount = await Discount.find({
                expiryDate: { $lt: new Date() }
            });
            expiriedDiscount.forEach(async coupon => {
                coupon.active = false;
                await coupon.save();
                const courses = await Course.find({discountedCodeApplied: coupon.discountCode});
                courses.forEach(async course => {
                    course.discountedPrice = 0
                    course.discountedCodeApplied = ""
                    await course.save()
                })
            })
        })
        next()
    } catch (error) {
        console.log('error', error);
    }
}

module.exports = updateStatusDiscount