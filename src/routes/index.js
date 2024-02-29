const authRoute = require('./auth')
const userRoute = require('./user')
const courseRoute = require('./course')
const uploadRoute = require('./upload')
const passwordRoute = require('./password')
const blogRoute = require('./blog')
const discountRoute = require('./discount')

function route(app){
    app.use('/user', userRoute)

    app.use('/course', courseRoute)

    app.use('/auth', authRoute)

    app.use('/file', uploadRoute)

    app.use('/password', passwordRoute)

    app.use('/blog', blogRoute)

    app.use('/discount', discountRoute)
}

module.exports = route