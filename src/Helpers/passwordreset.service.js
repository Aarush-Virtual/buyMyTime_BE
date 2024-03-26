var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const { generateJwtSecret } = require('./user.helper');
const jwtSecret = process.env.JWT_SECRET; // Replace with a strong secret key
const emailSender = process.env.EMAIL; // Replace with your email address
const emailPassword = process.env.PASSWORD; // Replace with your email password
const { v4: uuidv4 } = require('uuid');
const APP_URL = process.env.FRONTEND_URL;
const generateResetPasswordToken = async () => {
  const uniqueValue = uuidv4();
  return uniqueValue;
}

const sendResetPasswordEmail = async (email, token) => {
  
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com', // Replace with your email provider's SMTP server
        port: 587, // Replace with port number
        secure: false, // Adjust based on your email provider's requirements
        auth: {
        user: emailSender,
        pass: emailPassword,
        },
    });

  const mailOptions = {
    from: emailSender,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset for your account.</p>
      <p>Click this link to reset your password within 1 hour:</p>
      <a href=http://localhost:3000/reset-password/${token}">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
  };

  try {
    console.log("mail options " , mailOptions , emailSender, emailPassword);
    const responseFromMail = await transporter.sendMail(mailOptions);
    return {
        status : true, 
        data : responseFromMail
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error; // Re-throw to handle in the route
  }
};

module.exports = {
  generateResetPasswordToken,
  sendResetPasswordEmail,
};
