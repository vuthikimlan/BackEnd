const userRoute = require('./user')
const authRoute = require('./auth')

function route(app){
    app.use('/user', userRoute)

    app.use('/auth', authRoute)
}

module.exports = route