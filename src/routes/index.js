const authRoute = require('./auth')
const userRoute = require('./user')
const courseRoute = require('./course')
const uploadRoute = require('./upload')

function route(app){
    app.use('/user', userRoute)

    app.use('/course', courseRoute)

    app.use('/auth', authRoute)

    app.use('/file', uploadRoute)
}

module.exports = route