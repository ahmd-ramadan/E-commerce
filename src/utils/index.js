const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const KEY = process.env.JWT_SECRET;

module.exports.GenerateSalt = async () => {
    return await bcrypt.genSalt(10);
};

module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
    enteredPassword,
    savedPassword,
) => {
    return (await bcrypt.compare(enteredPassword, savedPassword));
};

module.exports.GenerateSignature = async (payload, expires = "30d") => {
    try {
        return await jwt.sign(payload, KEY, { expiresIn: expires});
    } catch (error) {
        console.log(error);
        return error;
    }
};

module.exports.ValidateSignature = async (req) => {
    try {
        const signature = req.get("Authorization");
        // console.log(signature);
        const payload = await jwt.verify(signature.split(" ")[1], KEY);
        req.user = payload;
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports.ValidateSignature2 = async (token, req) => {
    try {
        const payload = jwt.verify(token, KEY);
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
