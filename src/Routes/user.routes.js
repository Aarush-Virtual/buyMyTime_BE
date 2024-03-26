const {Router} = require("express");
const router = Router();
const userController = require("../Modules/user.controller");
const {customValidation, verifyToken} = require("../Middlewares/common.middleware");
const { userSchema, loginSchema, resetPasswordValidation, reviewDocumentValidator } = require("../validator/user.validator");
const { upload } = require("../Helpers/user.helper");
const { USER_TYPES } = require("../Constants/common.constants");
const initUserRoutes = () => {
    const {registerUser , loginUser, resetPassword, sendResetPasswordLink,submitPassport , listCustomer, getVerificationStatus, reviewDocument , approveDocument} = userController();
    router.route("/user/register").post(customValidation(userSchema, "body") , registerUser);
    router.route("/user/login").post(customValidation(loginSchema, "body"), loginUser);
    router.route("/user/password/send").post(sendResetPasswordLink);
    router.route("/user/upload/passport").post(verifyToken(), 
        (req, res, next) => {
        // Using a wrapper function to handle errors from Multer middleware
        upload.single("passport")(req, res, (err) => {
            if (err) {
                // Handle the Multer error here and send an appropriate response
                return res.status(400).json({ success: false, message: err.message });
            }
            // If no Multer error, proceed to the next middleware
            next();
        });
    },
    submitPassport
    );
    router.route("/user/password/reset").post(customValidation(resetPasswordValidation , "body"), resetPassword)
    router.route("/user/status/verification").get(verifyToken(), getVerificationStatus)
    // admin routes for user 
    router.route("/user/customer/list").get(verifyToken(USER_TYPES.ADMIN), listCustomer);
    router.route("/user/review/document").get(verifyToken(USER_TYPES.ADMIN) ,customValidation(reviewDocumentValidator , "query"),  reviewDocument);
    router.route("/user/review/document/approve").put(verifyToken(USER_TYPES.ADMIN), approveDocument)
    return router;
}
module.exports = initUserRoutes;