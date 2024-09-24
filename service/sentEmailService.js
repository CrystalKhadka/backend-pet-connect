const nodemailer = require('nodemailer');

// Function to send email
const sendEmail = async (email, link) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'khadkacrystal23@gmail.com',
      pass: 'aaqwfjivpgtogqdp',
    },
  });

  var mailOptions = {
    from: 'khadkacrystal23@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click this link to reset your password: ${link}`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = sendEmail;
