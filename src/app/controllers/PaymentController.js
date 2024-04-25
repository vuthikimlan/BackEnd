let config = require('config');
let moment = require('moment');
const { getIdUser } = require('../../service/getIdUser');
const Users = require('../models/Users');
const Order = require('../models/Order');
const Course = require('../models/Course');

// // "vnp_ReturnUrl": "http://localhost:3000/"

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


class PaymentController {
    async createPaymentWithVNPAY(req, res) {
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let tmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');
        let vnpUrl = config.get('vnp_Url');
        let returnUrl = config.get('vnp_ReturnUrl'); 
        //Sau khi giao dịch thành công sẽ chuyển đến trang vnp_ReturnUrl trong
        // file BE/config. Cần thay đổi cho phù hợp với giao diện

        let date = new Date();

        let createDate = moment(date).format('YYYYMMDDHHmmss');
        // let orderId = moment(date).format('DDHHmmss');
        let orderId = req.body.orderId
        let amount = req.body.amount;  // thay đổi
        let bankCode = req.body.bankCode; // thay đổi
        
        let orderInfo = req.body.orderDescription; //Thay đổi - nội dung thanh toán
        let orderType = req.body.orderType; //Thay đổi
        let locale = req.body.language; // thay đổi
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if(bankCode !== null && bankCode !== '' &&  bankCode !== undefined){
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.status(200).json({
            vnpUrl: vnpUrl
        })

    }

    async getResponseCode(req, res) {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
    
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        vnp_Params = sortObject(vnp_Params);
        let config = require('config');
        let secretKey = config.get('vnp_HashSecret');
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
         
        if(secureHash === signed){
            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
            const userId = getIdUser(req)
            const order = await Order.findById(orderId)
            // Khi đơn hàng đc thanh toán thành công thì sẽ có một mã được trả về là RspCode: '00', 
            // Nếu rspCode = 00 thì sẽ thêm những khóa học ở giỏ hàng vào boughtCourses và giỏ hàng sẽ
            // trống và đơn hàng sẽ được cập nhật trạng thái là đã hoàn thành
            // Còn nếu rspCode khác 00 thì sẽ xóa/hủy đơn hàng đó đi 
            if(rspCode === '00' ) {
                //Tìm kiếm khóa học trong đơn hàng của người dùng
                const courses = order?.courses 
                
                // Lưu khóa học đã mua vào boughtCourses của user
                const boughtCourse = await Users.findById(userId)
                const courseId = courses.map(course => course._id)
                boughtCourse.boughtCourses.push(...courseId)
                // Xóa giỏ hàng sau khi thanh toán thành công
                boughtCourse.shoppingCart = []
                await boughtCourse.save()

                // Thêm id của người dùng vào khóa học
                for(let course of courses) {
                    const inforCourse = await Course.findById(course._id)
                    inforCourse.users.push(userId)
                    await inforCourse.save()
                }

                // Cập nhật trạng thái đơn hàng thành hoàn thành
                await order.updateOne({ status: 'completed' })
                await order.save()
            } else {
                await order.updateOne({ status: 'cancelled' })
            }

            res.status(200).json({
                RspCode: '00', 
                Message: 'success'
            })

        }
        else {
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
        }
    }

    async createPaymentWithMoMo(req, res) {
        let responseBody  = ''
        //parameters
        var accessKey = 'F8BBA842ECF85';
        var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        var orderInfo = 'Thanh toán qua MOMO'; //Mô tả - có thể thay đổi
        var partnerCode = 'MOMO';
        var redirectUrl = 'http://localhost:3000/payment-success'; //Khi thanh toán thành công thì dẫn đến trang thông báo thành công
        var ipnUrl = 'http://localhost:3000/payment-ipn'; //Đường dẫn nhận kết quả
        var requestType = "payWithMethod";
        var amount =  req.body.amount; // Thay đổi
        var orderId = req.body.orderId //Thay bằng _id của đơn hàng
        var requestId = orderId;
        var extraData ='';
        var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
        var orderGroupId ='';
        var autoCapture =true;
        var lang = 'vi';

        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        var rawSignature = "accessKey=" + accessKey + 
                        "&amount=" + amount + 
                        "&extraData=" + extraData + 
                        "&ipnUrl=" + ipnUrl + 
                        "&orderId=" + orderId + 
                        "&orderInfo=" + orderInfo +
                        "&partnerCode=" + partnerCode + 
                        "&redirectUrl=" + redirectUrl + 
                        "&requestId=" + requestId + 
                        "&requestType=" + requestType;
        //puts raw signature
        console.log("--------------------RAW SIGNATURE----------------")
        console.log(rawSignature)
        //signature
        const crypto = require('crypto');
        var signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
        console.log("--------------------SIGNATURE----------------")
        console.log(signature)

        //json object send to MoMo endpoint
        const requestBody = JSON.stringify({
            partnerCode : partnerCode,
            partnerName : "Test",
            storeId : "MomoTestStore",
            requestId : requestId,
            amount : amount,
            orderId : orderId,
            orderInfo : orderInfo,
            redirectUrl : redirectUrl,
            ipnUrl : ipnUrl,
            lang : lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData : extraData,
            orderGroupId: orderGroupId,
            signature : signature
        });
        //Create the HTTPS objects
        const https = require('https');
        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        }
        //Send the request and get the response
        const reqq = https.request(options, ress => {
            console.log(`Status: ${ress.statusCode}`);
            console.log(`Headers: ${JSON.stringify(ress.headers)}`);
            ress.setEncoding('utf8');
            ress.on('data', (body) => {
                console.log('payUrl: ', JSON.parse(body).payUrl);
                res.json({ payUrl: JSON.parse(body).payUrl });
            });
            ress.on('end', () => {
                console.log('No more data in response.');
            });
        })

        reqq.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });
        // write data to request body
        console.log("Sending....")
        reqq.write(requestBody);
        // reqq.end();
        console.log('requestBody', requestBody);
    }

    // Tổng doanh thu của toàn bộ hệ thống theo ngày - tháng - năm
    async totalRevenueSystemsByDay(req, res) {
        const order = await Order.find({status: 'completed'});
        const revenueByDay = {}
        order.forEach(order => {
            const day = order.orderDate.toLocaleDateString('en-GB');
            if(!revenueByDay[day]) {
                revenueByDay[day] = 0;
            }

            revenueByDay[day] += order.totalPrice;
        })
        
        // Chuyen thanh mang
        const data = Object.keys(revenueByDay).map(key => ({
            day: key,
            revenue: revenueByDay[key]
        }));

        res.status(200).json({
            data: data
        });
    }
    async totalRevenueSystemsByMonth(req, res) {
        const order = await Order.find({status: 'completed'});
        const revenueByMonth = {}
        order.forEach(order => {
            const month = order.orderDate.toLocaleDateString('en-GB', {month: '2-digit', year: 'numeric'});
            if(!revenueByMonth[month]) {
                revenueByMonth[month] = 0;
            }

            revenueByMonth[month] += order.totalPrice;
        })
        
        // Chuyen thanh mang
        const data = Object.keys(revenueByMonth).map(key => ({
            month: key,
            revenue: revenueByMonth[key]
        }));

        res.status(200).json({
            data: data
        });
    }
    async totalRevenueSystemsByYear(req, res) {
        const order = await Order.find({status: 'completed'});
        const revenueByYear = {}
        order.forEach(order => {
            const year = order.orderDate.getFullYear();
            if(!revenueByYear[year]) {
                revenueByYear[year] = 0;
            }

            revenueByYear[year] += order.totalPrice;
        })
        
        // Chuyen thanh mang
        const data = Object.keys(revenueByYear).map(key => ({
            year: key,
            revenue: revenueByYear[key]
        }));

        res.status(200).json({
            data: data
        });
    }

    async totalRevenueInstructorByMonth(req, res){
        try {
            const teacherId = getIdUser(req)
            let revenue = 0
            const revenueByMonth = {}

            const order = await Order.find({status: 'completed'})
                .populate('courses')
                .populate({
                    path: 'courses.createdBy', 
                    select: '_id' 
                  })
            
            order.forEach(order => {
                const month = order.orderDate.toLocaleDateString('en-GB', 
                    {month: '2-digit', year: 'numeric'}
                )
                // Lay khoa hoc cua tung don hang
                const courses = order.courses

                // Loc ra khoa hoc cua giang vien
                const teacherCourses = courses.filter(course => {
                    return course.createdBy._id.toString() === teacherId;
                });

                // Loc ra khoa hoc tron truong price
                const revenueCourses = order.price.filter(course => 
                    teacherCourses.some(c => c._id.equals(course.courseId))
                )

                // Tinh doanh thu mỗi đơn hàng
                
                revenueCourses.forEach(course => {
                    revenue += course.price
                })

                if(!revenueByMonth[month]) {
                    revenueByMonth[month] = 0;
                }

                revenueByMonth[month] += revenue
            })

            const data = Object.keys(revenueByMonth).map(key => ({
                month: key,
                revenue: revenueByMonth[key]
            }));
            res.status(200).json({
                data: data
            });
            
        } catch (error) {
            console.log(error);
            
        }
    }

}

module.exports = new PaymentController