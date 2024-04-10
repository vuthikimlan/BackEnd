const { isValidObjectId } = require('mongoose')
const Order = require('../models/Order')
const Users = require('../models/Users')
const { getIdUser } = require('../../service/getIdUser')


class OrderController {
  async addOrder(req, res) {
        try {
            const userId = getIdUser(req)

            //Lấy thông tin giỏ hàng và khóa học của người dùng
            const user = await Users.findById(userId)
                .select('shoppingCart')
                .populate('shoppingCart.courseId', 'name image price')
            
            //Lấy danh sách id khóa học trong giỏ hàng 
            const courses = user?.shoppingCart?.map(item  =>(
                 item.courseId._id
            ))

            
            // Tính tổng giá trị đơn hàng
            const totalPrice = user.shoppingCart.reduce((sum, item) => {
                return sum + item.courseId.price * item.quantity; 
            }, 0);

            const newOrder = new Order({
                orderId: Date.now().toString(),
                user: userId,
                courses,
                price: totalPrice,
                totalPrice,
                orderDate: new Date()
            })
    
            const saveOrder = await newOrder.save()

            //Cập nhật đơn hàng vào user
            const orderUser = await Users.findById(userId)
            orderUser.order.push(newOrder._id);
            await orderUser.save();
    
            res.status(200).json({
                data: saveOrder,
                error: null,
                statusCode: 200,
                success: true,
            })
            
        } catch (error) {
            console.log("error", error)
            res.status(500).json(error); 
        }

    }

    async getAllOrder(req, res) {
        const totalOrder = await Order.countDocuments()

        const items = await Order.find({}).populate('user', 'name username email').populate('courses', '_id image name price createdBy')
        res.status(200).json({
            success: true,
            error: null,
            statusCode: 200,
            data: {
                total: totalOrder,
                items
            }
        })
    }

    async getByIdOrder(req, res) {
        try {
            const id = req.params.id

            if(isValidObjectId(id)) {
                const order = await Order.findById({_id: id}).populate('user', 'name username email').populate('courses', '_id image name price')
                res.status(200).json({
                    success:true,
                    error:null,
                    statusCode: 200,
                    data: order
                })

            }
        } catch (error) {
            console.log('error', error);
        }
    }

    async updateOrder(req, res) {
        try {
            const updateOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {new: true})
            if(!updateOrder) {
                return res.status(404).json({
                    message: "Không tìm thấy bản ghi",
                    statusCode: 404,
                    success: false
                })
            }
            res.status(200).json({
                data: updateOrder,
                error: null,
                statusCode: 200,
                success: true
            })
        } catch (error) {
           res.status(500).json(error) 
        }
    }

    async delOrder(req, res) {
        try {
            await Order.deleteOne({_id: req.params.id})
            res.status(200).json({
                message: "Xóa Order thành công"
            })
        } catch (error) {
            res.status(500).json(error)
        }
    }

    async filterOrder(req, res) {
        try {
            const {status, orderId} = req.body
            let filter = {}

            if(status) filter.status = {$regex: new RegExp(status, 'i')}
            if(orderId) filter.orderId = {$regex: new RegExp(orderId, 'i')}
            
            const result = await Order.find(filter)
            const totalOrder = await Order.countDocuments(filter)

            res.status(200).json(
                {
                    success: true,
                    error: null,
                    statusCode: 200,
                    data: {
                        total: totalOrder,
                        items: result
                    }
                }
            )

        } catch (error) {
            console.log('error', error);
            // res.status(500).json({
            //     error: 'Có lỗi trong quá trình xử lý yêu cầu'
            // })
        }
    }

}

module.exports = new OrderController