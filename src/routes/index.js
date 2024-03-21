const authRoute = require('./auth')
const userRoute = require('./user')
const courseRoute = require('./course')
const uploadRoute = require('./upload')
const passwordRoute = require('./password')
const blogRoute = require('./blog')
const discountRoute = require('./discount')
const orderRoute = require("./order")
const paymentRoute = require("./payment")
const commentRoute = require("./comment")
const fieldRoute = require("./field")
const approvalRoute = require("./approvalRequest")
const profileRoute = require("./getProfileUser")


function route(app){
    app.use('/user', userRoute)

    app.use('/course', courseRoute)

    app.use('/auth', authRoute)

    app.use('/file', uploadRoute)

    app.use('/password', passwordRoute)

    app.use('/blog', blogRoute)

    app.use('/discount', discountRoute)

    app.use('/order', orderRoute)

    app.use('/payment', paymentRoute)

    app.use('/comment', commentRoute)

    app.use('/field', fieldRoute)

    app.use('/approve', approvalRoute)

    app.use('/profile', profileRoute)
}

module.exports = route