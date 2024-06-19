const {ValidateSignature} = require('../utils');

module.exports.isAuth = async(req, res, next) => {
    const payload = await ValidateSignature(req);
    // console.log(payload);
    if(!payload) {
        next(new Error( 'Token expired please login again', {status: 401}));
    }
    next();
}