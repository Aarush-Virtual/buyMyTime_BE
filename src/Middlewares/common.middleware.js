const { errorFunction } = require("../Constants/common.constants");
var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config()
const customValidation = (joiValidator, payloadType, isMobile = false) => {
    // payload type can be body or query as of now
    return (req, res, next) => {
        const payload = req[payloadType]
        const { error } = joiValidator.validate(payload);
        if (error) {
                res.status(403);
                return res.json(
                    errorFunction(false, error.message.replaceAll('"', ""))
                )
        }
        else {
            next();
        }
    }
  }
const verifyToken = (accessibleUser) => {
  
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>' format
      
        if (!token) {
          return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
      
        try {
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Verify token with secret
          // Check token expiration (exp) from decoded payload
          
          if (decodedToken.exp < Date.now() / 1000) { // exp is in seconds, convert to milliseconds
            return res.status(401).json({ message: 'Unauthorized: Token expired' });
          }
      
          // Attach decoded user data to the request object for further use
          req.user = decodedToken;
          if(accessibleUser && decodedToken.userType !== accessibleUser) {
              return res.status(401).json({ message: 'Unauthorized to perform the task' });
          }
          next(); // Continue to the route handler if token is valid and not expired
        } catch (error) {
          console.error('Error verifying token:', error);
          return res.status(403).json({ message: 'Forbidden: Invalid token' }); // Generic error for invalid tokens (e.g., malformed, wrong signature)
        }
      };
  
}


  module.exports = {customValidation , verifyToken};