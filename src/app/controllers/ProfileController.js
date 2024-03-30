const { getIdUser } = require("../../service/getIdUser")
const Users = require("../models/Users")

class ProfileController {
    async profileUser( req, res) {
        try {
            const userId = getIdUser(req)
            const user = await Users.findById(userId)
            .populate('courses')
            .populate({
                path: 'coursesPosted', 
                select: " -createdBy ",
                populate: {
                    path: "field",
                    select: " title ",
                }
        })
            
    
            res.json({
                success: true,
                data: user
            })
            
        } catch (error) {
            console.log('error', error);
        }
    }
}

module.exports = new ProfileController