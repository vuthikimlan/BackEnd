const userRoute = require('./user')

function route(app){
    app.use('/user', userRoute)
}

module.exports = route