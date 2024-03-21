const { SendResponse } = require("../Constants/common.constants");
const { generateResetPasswordToken, sendResetPasswordEmail } = require("../Helpers/passwordreset.service");
const { registerUserHashing, comparePassword, generateAuthToken } = require("../Helpers/user.helper");
const MasterUser = require("../Models/MasterUsers");
const ServiceCategoryType = require("../Models/ServiceCategory.model");

const userController = () => {
    const registerUser = async (req, res) => {
        const request = req.body;
        try {
            const { fullName, userName, email, phoneNumber, password, preferredServiceCategoryIds } = request;
            const preferredCategories = preferredServiceCategoryIds || [];
            const existingUserByUsername = await MasterUser.findOne({ where: { userName } });
            if (existingUserByUsername) {
              return res.status(400).json({ success: false, message: 'Username already exists' });
            }

            // Check for existing email
            const existingUserByEmail = await MasterUser.findOne({ where: { email } });
            if (existingUserByEmail) {
              return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            // Check for exiting phone
            const existingUserByPhone = await MasterUser.findOne({ where: { phoneNumber } });
            if (existingUserByPhone) {
              return res.status(400).json({ success: false, message: 'Phone Number already exists' });
            }
            const validCategoryIds = await Promise.all(
              preferredCategories.map(async (id) => {
                const category = await ServiceCategoryType.findByPk(id);
                return !!category; // Check if category exists (truthy or falsy)
              })
            );
              console.log("validCateogry Id " , validCategoryIds);
            if (!validCategoryIds.every(Boolean)) {
              return res.status(400).json({success : false,  message : "Invalid Service Category type(s)"});
            }
            const hashedUserObject = await registerUserHashing(request);
            const user = await MasterUser.create({
              ...hashedUserObject,
              preferredServiceCategoryIds: preferredCategories,
            });
            return res.status(200).json({status : true , message : "User Registered Successfully"});
        } catch (error) {
            console.error("error in registration " , error);
            return res.status(500).json({status : false , message : "User registration failed"});
        }
    }
    const loginUser = async (req , res) => {
        const { email, password } = req.body;

        try {
          const user = await MasterUser.findOne({ where: { email } });
          if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }
          console.log("found user" , user.dataValues);
          const isPasswordValid = await comparePassword(user.dataValues.password , password);
          if (!isPasswordValid) {
            return res.status(401).json({ message: 'Please enter correct password' });
          }

          const token = generateAuthToken(user.dataValues.id); // Generate authentication token
          console.log("token value " , token);
          res.status(200).json({
            success: true,
            message: 'Login successful',
            token, // Include the token in the response
    });
      } 
      catch (error) {
        console.error("error in login" , error);
        return res.status(500).json({status : false , message : "User Login failed"}); 
      }
    }
    const resetPassword = async (req, res) => {
      const {email} = req.body;
      try {
        console.log("Email in the reset password " , email);
        const user = await MasterUser.findOne({ where : { email }});
        console.log("user query returning " , user);
        if (!user) {
          return res.status(400).json({ message: 'Email address not found' });
        }
        const resetToken = generateResetPasswordToken(user.id);
        
        console.log("token from generate reset password " , resetToken);

        const sendEmail = await sendResetPasswordEmail(email, resetToken)
        console.log(sendEmail);
        if(sendEmail.status) {
          return res.status(200).json({
            status : true, 
            message : "Please check your email to reset the password"
          })
        }else{
          return res.status(500).json({
            status : true, 
            message : "Something went wrong"
          })
        }

      } catch (error) {
        console.error("error in login" , error);
        return res.status(500).json({status : false , message : error.message || "Reset Password Failed, Please try again later"});  
      }
    }
    const forgotPassword = async (req, res) => {
      try {
          
      } catch (error) {
        
      }
    }
    const submitPassport = async (req, res) => {
      const {userId} = req.user;
      const {passportNumber} = req.body;
      try {
          console.log("file -------> " , req.file);
          // {
          //   fieldname: 'passport',
          //   originalname: 'e_sign.png',
          //   encoding: '7bit',
          //   mimetype: 'image/png',
          //   destination: 'passport/',
          //   filename: '0b70a9c97602671fc6bb5da61b7e3d50',
          //   path: 'passport\\0b70a9c97602671fc6bb5da61b7e3d50',
          //   size: 12890
          // }

          console.log("body ---------> " , req.body);
          // { passportNumber: 'aarush123456' }

          // upload the file path and the passport number to the 
          const updateUser = await MasterUser.update({passportNumber : passportNumber , passportURL : req.file.path} , {where : {id : userId}});
          console.log("update user ------> " , updateUser);
          return res.status(200).json({status : true, message : "File uploaded successfully, please wait until verified"});
      } catch (error) {
        return res.status(500).json({status : false , message : error.message || "Upload failed, please try again later"});
      }
    }
    return {
        registerUser,
        loginUser,
        resetPassword,
        forgotPassword,
        submitPassport
    }
}


module.exports = userController;