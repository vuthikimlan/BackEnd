const authRoute = require('./auth')
const userRoute = require('./user')
const courseRoute = require('./course')

function route(app){
    app.use('/user', userRoute)

    app.use('/course', courseRoute)

    app.use('/auth', authRoute)
}

module.exports = route