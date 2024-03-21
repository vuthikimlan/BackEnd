const  isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next()
    } else {
        res.json({
            message: "Vui lòng đăng nhập"
        })
    }
}

module.exports = isAuthenticated