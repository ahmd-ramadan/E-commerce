const jwt = require('jsonwebtoken');
const User = require('../../database/models/User.js');
const asyncHandler = require('./asyncHandler');

module.exports.auth = (accessRoles) => {
    return asyncHandler(
        async(req, res, next) => {
            const {authorization} = req.headers;
            // console.log(authorization);
            if (!authorization) {
                return next(new Error("Please login first", { status: 400 }));
            }

            //! Check prefix token
            if (!authorization.startsWith(process.env.TOKEN_PREFIX)) {
                return next(new Error("Invalid token prefix", { status: 400 }));
            }

            //! Get token without prefix
            const token = authorization.split(' ')[1];
            // console.log(token);
            
            //! decode token
            const decodedData = jwt.verify(token, process.env.JWT_SECRET);
            if (!decodedData.id) {
                return next(new Error("Invalid token payload", { status: 400 }));
            }

            //! User Exist ?
            const findUser = await User.findById(
                decodedData.id,
                "name email role isLoggedIn"
            ); 
            if (!findUser) {
                return next(new Error("Please signUp first", { status: 404 }));
            }

            //! If user change his password he must be loggin again
            if(!findUser.isLoggedIn){
                    return next(new Error("You must log in again, try later!", { status: 400 }));
            }
            
            // console.log(findUser.role);
            //! Auhtorization
            if (!accessRoles.includes(findUser.role)) {
                return next(new Error("Unauthorized", { status: 401 }));
            }

            //! Have Permission
            // ----------------------------------------------------------------

            req.authUser = findUser;
            next();
        }
    )
};
