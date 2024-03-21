const {Router} = require("express");
const router = Router();
const userController = require("../Modules/user.controller");
const {customValidation, verifyToken} = require("../Middlewares/common.middleware");
const { userSchema, loginSchema } = require("../validator/user.validator");
const { upload } = require("../Helpers/user.helper");
const initUserRoutes = () => {
    const {registerUser , loginUser, resetPassword, submitPassport} = userController();
    router.route("/user/register").post(customValidation(userSchema, "body") , registerUser);
    router.route("/user/login").post(customValidation(loginSchema, "body"), loginUser);
    router.route("/user/password/reset").post(verifyToken, resetPassword);
    router.route("/user/upload/passport").post(verifyToken, 
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
    )
    return router;
}
module.exports = initUserRoutes;