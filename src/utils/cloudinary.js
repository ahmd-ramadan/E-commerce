const { v2: cloudinary } = require('cloudinary');

module.exports.cloudinaryConnection = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDAINARY_CLOUD_NAME,
        api_key: process.env.CLOUDAINARY_API_KEY,
        api_secret: process.env.CLOUDAINARY_API_SECRET,
    });
    return cloudinary;
};