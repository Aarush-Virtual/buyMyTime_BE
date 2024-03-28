const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const multer = require('multer');
const path = require("path");
dotenv.config();
const { Op } = require('sequelize');
// Function to hash a password with salting
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10); // Adjust salt rounds based on security needs
  return await bcrypt.hash(password, salt);
}

// Function to compare hashed password with login attempt
async function comparePassword(hashedPassword, plainTextPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}

// Registration process (replace with your user creation logic)
async function registerUserHashing(userData) {
  const hashedPassword = await hashPassword(userData.password);
  userData.password = hashedPassword; // Replace plain text password with hash
  return userData;
  // Create user with updated password in the database
}


const generateJwtSecret = async () => {
  try {
        const crypto = require('crypto');

    // Generate a random byte array for the secret (32 bytes for 256-bit security)
    const secretBytes = crypto.randomBytes(32);

    // Convert the byte array to a base64 encoded string for easier storage
    const jwtSecret = secretBytes.toString('base64');

    return jwtSecret;
  } catch (error) {
    return null;
  }
}

const generateAuthToken = (payload) => {
  // const payload = { userId }; // Payload for the token
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }); // Token expires in 24 hour
};

const storage = multer.diskStorage({
  destination: 'passport/', // Replace with your desired local folder for uploads
  filename: (req, file, cb) => {
    // Extracting the file extension
    const ext = path.extname(file.originalname);
    // Generating a unique filename with the original extension
    const uniqueFilename = `${Date.now()}${ext}`;
    cb(null, uniqueFilename);
  }
});

// const upload = multer({
//   dest: 'passport/', // Replace with your desired local folder for uploads
// });
const upload = multer({ storage: storage });


async function searchData(model, searchParams) {
  try {
    let whereConditions = {};

    // Construct dynamic where conditions based on search parameters
    for (const column in searchParams) {
      if (searchParams.hasOwnProperty(column)) {
        whereConditions[column] = {
          [Op.like]: `%${searchParams[column]}%`, // Case-insensitive search
        };
      }
    }

    // Perform the search using Sequelize
    const results = await model.findAll({ where: whereConditions });

    return results;
  } catch (error) {
    console.error('Error during search:', error);
    throw error; // Re-throw to handle errors in calling function
  }
}
module.exports = {registerUserHashing , comparePassword, hashPassword , generateJwtSecret, generateAuthToken , upload , searchData}