const jwt = require('jsonwebtoken')

const getIdUser = (req) => {
    const token = req.headers?.authorization?.split(" ")[1]
    const userInfor = jwt.verify(token, "This is JWT")  
    const userId = userInfor?.data?._id

    return userId
}

module.exports = {
    getIdUser,
}