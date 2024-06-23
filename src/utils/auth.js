const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Types } = require('mongoose');

const KEY = process.env.JWT_SECRET;

module.exports.generateSalt = async () => {
    return await bcrypt.genSalt(10);
};

module.exports.generatePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};

module.exports.validatePassword = async (
    enteredPassword,
    savedPassword,
) => {
    return (await bcrypt.compare(enteredPassword, savedPassword));
};

module.exports.generateToken = async (payload, expires = "30d") => {
    try {
        // console.log(payload);
        return jwt.sign(payload, KEY, { expiresIn: expires});
    } catch (error) {
        console.log(error);
        return error;
    }
};

module.exports.authToken = async (req) => {
    try {
        const token = req.get("Authorization");
        // console.log(token);
        const payload = jwt.verify(token.split(" ")[1], KEY);
        req.user = payload;
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports.validateToken = async (token, req) => {
    try {
        const payload = await jwt.verify(token, KEY);
        req.user = payload;
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports.generateUniqueString = () => {
    return uuidv4();
};



// Custom validation function for ObjectId
module.exports.validateObjectId = (value, helper) => {
    const isValid = Types.ObjectId.isValid(value);
    return isValid ? value : helper.message('Invalid ObjectId');
};