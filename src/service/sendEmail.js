const Users = require("../app/models/Users");
const nodemailer = require("nodemailer");

const transpoter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "lani02km2@gmail.com",
    pass: "lghi dhvo dzxq lpxv",
  },
});
const sendActivationEmail = async (courseName, activationLink, userId) => {
  const user = await Users.findById(userId);

  const mailOptions = {
    from: "E-learning",
    to: user.email,
    subject: "Kích hoạt khóa học",
    html: `
      <p>Cảm ơn bạn đã mua khóa học "${courseName}".</p>
      <p>Vui lòng nhấn vào liên kết sau để kích hoạt khóa học:</p>
      <a href="${activationLink}">${activationLink}</a>
      <p>Khóa học có thời hạn 1 năm kể từ ngày kích hoạt</p>
    `,
  };

  try {
    await transpoter.sendMail(mailOptions);
    console.log("Email kích hoạt khóa học đã được gửi thành công");
  } catch (error) {
    console.error("Lỗi khi gửi email kích hoạt khóa học:", error);
  }
};

module.exports = {
  sendActivationEmail,
};
