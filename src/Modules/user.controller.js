const { generateResetPasswordToken, sendResetPasswordEmail } = require("../Helpers/passwordreset.service");
const { registerUserHashing, comparePassword, generateAuthToken, generateJwtSecret } = require("../Helpers/user.helper");
const MasterUser = require("../Models/MasterUsers");
const ServiceCategoryType = require("../Models/ServiceCategory.model");
const moment = require("moment");
const fs = require("fs");
const mime = require('mime-types');
const path = require("path");
const { Op } = require('sequelize');
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
            console.log("registered user response in the end " , user);
            const token = generateAuthToken({userId : user.dataValues.id, userType : user.dataValues.userType , isVerifiedUser : user.dataValues.isVerifiedUser}); // Generate authentication token

            return res.status(200).json({status : true , message : "User Registered Successfully" , token : token});
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
          let verificationPending = false;
          if(!user?.dataValues?.isVerifiedUser && (user?.dataValues?.passportNumber !== null || user?.dataValues?.passportNumber !== "")) {
            verificationPending = true;
          }
          const token = generateAuthToken({userId : user.dataValues.id, userType : user.dataValues.userType , isVerifiedUser : user.dataValues.isVerifiedUser, verificationPending : verificationPending, name : user.dataValues.fullName}); // Generate authentication token
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
    const sendResetPasswordLink = async (req, res) => {
      const {email} = req.body;
      try {
        console.log("Email in the reset password " , email);
        const user = await MasterUser.findOne({ where : { email }});
        console.log("user query returning " , user);
        if (!user) {
          return res.status(400).json({ message: 'Email address not found' });
        }
          const resetPasswordToken = await generateResetPasswordToken();

        const sendEmail = await sendResetPasswordEmail(email, resetPasswordToken);
        if(sendEmail.status) {
          console.log("email sending data ", sendEmail?.data)
        // set the values to the table 
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();
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
      const { email } = req.body;
      try {
        const user = await MasterUser.findOne({ where : { email }});
        console.log("user query returning " , user);
        if (!user) {
          return res.status(400).json({ message: 'Email address not found' });
        }
        // generate the jwt key and d time and store that in the db and send the unique 
        const getUniqueValue = await generateResetPasswordToken();
        console.log("getUniqueValue ----> " , getUniqueValue);


        user.resetPasswordToken = getUniqueValue;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();

      } catch (error) {
        return res.status(500).json({status : false, message : error.message || "Forgot password failed, please try again later"});
      }
    }
    const submitPassport = async (req, res) => {
      const {userId} = req.user;
      const {passportNumber , verificationDocumentType} = req.body;
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
          const updateUser = await MasterUser.update({passportNumber : passportNumber , passportURL : req.file.path, verificationDocumentType : verificationDocumentType} , {where : {id : userId}});
          console.log("update user ------> " , updateUser);
          return res.status(200).json({status : true, message : "File uploaded successfully, please wait until verified"});
      } catch (error) {
        return res.status(500).json({status : false , message : error.message || "Upload failed, please try again later"});
      }
    }
    const resetPassword = async (req, res) => {
      const {password , resetPasswordToken} = req.body;
      try {
        const userToResetPassword = await MasterUser.findOne({ where : {resetPasswordToken : resetPasswordToken}});
        if(userToResetPassword?.resetPasswordToken != resetPasswordToken ){
          return res.status(401).json({ message: 'Password reset request not found' });
        }
        console.log({
          currenttime: new Date(),
          expiryTime : userToResetPassword?.resetPasswordExpires
        })
        if(userToResetPassword?.resetPasswordExpires < new Date())  {
          return res.status(401).json({ message: 'Password reset link expired, please create a new link' });
        }
        const {password : newPassword} = await registerUserHashing({password : password});
        userToResetPassword.password = newPassword;
        userToResetPassword.resetPasswordToken = null;
        userToResetPassword.resetPasswordExpires = null;

        await userToResetPassword.save();

        return res.status(200).json({status : true, message : "Password updated successfully, please login to continue"});
        
      } catch (error) {
        return res.status(500).json({status : false, message : error.message || "Reset Password Failed, Please try again later"})
      }
    }
    const listCustomer = async (req, res) => {
      const { isVerifiedUser, page = 1, limit = 3, userType, searchParams, documentStatus } = req.query;
      try {
        const offset = (page - 1) * limit;
        let whereConditions = {
          isVerifiedUser,
          userType,
        };
    
        if (documentStatus) {
          // Add document status condition
          whereConditions[Op.or] = [
            { passportNumber: { [Op.ne]: null } },
            { passportURL: { [Op.ne]: null } },
            { verificationDocumentType: { [Op.ne]: null } },
          ];
        }
    
        if (searchParams) {
          // Add search conditions
          const searchableColumns = ['fullName', 'email', 'userName'];
          const searchTerm = `%${searchParams}%`;
          whereConditions[Op.and] = [
            { [Op.or]: searchableColumns.map(column => ({ [column]: { [Op.like]: searchTerm } })) },
          ];
        }
    
        const allUsersAndServiceProvider = await MasterUser.findAll({
          where: whereConditions,
          attributes: {
            exclude: ["password", "resetPasswordToken", "resetPasswordExpires"]
          },
          offset,
          limit,
        });
    
        const totalUsers = await MasterUser.count({
          where: whereConditions
        });
    
        const totalPages = Math.ceil(totalUsers / limit);
    
        return res.status(200).json({ status: true, message: "User found successfully", data: allUsersAndServiceProvider, count: totalUsers, page: totalPages });
    
      } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "List customer failed" });
      }
    }
    
    const getVerificationStatus = async (req, res) => {
      const {userId} = req.user;
      try {
        console.log("user id -------->", userId )
        const getVerStatus = await MasterUser.findByPk(userId , {
          attributes : ["isVerifiedUser" , "passportNumber" , "passportURL", "verificationDocumentType"]
        });

        return res.status(200).json({status : true, message: "User found successfully" , data : getVerStatus})

      } catch (error) {
        return res.status(500).json({status : false , message : error.message || "Verification status failed, please try again"});
      }
    }
    const reviewDocument = async (req, res) => {
      const { userId } = req.query;
    
      try {
        const getDocument = await MasterUser.findByPk(userId, {
          attributes: ["passportNumber", "passportURL", "verificationDocumentType"]
        });
        if(!getDocument?.dataValues)    {
          return res.status(404).json({ status: false, message: "User not found!" });
        }
        if (!getDocument || !getDocument.dataValues.passportNumber || !getDocument.dataValues.passportURL || !getDocument.dataValues.verificationDocumentType) {
          return res.status(404).json({ status: false, message: "Documents not found!" });
        }
    
        const filePath = getDocument.dataValues.passportURL;
    
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ status: false, message: 'File not found' });
        }
        function getContentType(filePath) {
          const extension = path.extname(filePath).toLowerCase();
          switch (extension) {
            case '.pdf':
              return 'application/pdf';
            case '.doc':
              return 'application/msword';
            case '.docx':
              return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            // Add more mime types as needed
            default:
              return 'application/octet-stream'; // Default to binary data if type is unknown
          }
        }
        // Set headers for file download
        const contentType = getContentType(filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);
    
        // Create read stream from file and pipe it to response
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    
        console.log("Document found:", getDocument);
    
      } catch (error) {
        return res.status(500).json({ status: false, message: error.message || "Can not view the document now, please try again later" });
      }
    };
    const approveDocument = async (req, res) => {
      const {userId , status} = req.query;
      try {
        const updateDocument = await MasterUser.update({isVerifiedUser : status} , {where : {id : userId}});
        return res.status(200).json({status : true, message : "User verified successfully"});
      } catch (error) {
        return res.status(500).json({ status: false, message: error.message || "Can not view the document now, please try again later" });
      }
    }
    
    const downloadFile = async (req , res) => {
      const {filename} = req.query;
      try {
        const filepath = path.join(__dirname, '../../passport', filename);
        console.log("file path --------->" , filepath);

        res.download(filepath, (err) => {
          if(err) {
              // Handle error, if any
              console.error("File download failed:", err);
              res.status(500).json({ success: false, message: "File download failed" });
          }
        })
      } catch (error) {
        return res.status(500).json({ status: false, message: error.message || "Internal server error, could not download file" });
      }
    }
    return {
        registerUser,
        loginUser,
        sendResetPasswordLink,
        forgotPassword,
        submitPassport,
        resetPassword,
        listCustomer,
        getVerificationStatus,
        reviewDocument,
        approveDocument,
        downloadFile
    }
}


module.exports = userController;