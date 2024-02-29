const jwt = require('jsonwebtoken')

const checkToken = (req, res, next) => {
    // Không áp dụng cho login và register
    if(req.url == '/auth/login' || req.url == '/auth/register') {
        next()
        return
    }

    const token = req.headers?.authorization?.split(" ")[1]
    try{ 
        const jwtObject = jwt.verify(token, "This is JWT")
        const isExpired = Date.now() >= jwtObject.exp * 1000
        if(isExpired) {
            res.status(200).json({
                success: false,
                error: null,
                message: "Token không hợp lệ"
            })
        }
        next()
    } catch(error) {
        console.log('error', error);
        res.status(400).json({
            message: "Token không hợp lệ."
        })
    }
}

module.exports = checkToken