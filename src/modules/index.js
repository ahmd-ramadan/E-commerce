const authRouter = require('./auth/auth.routes.js');
const userRouter = require('./user/user.routes.js');
const cartRouter = require('./cart/cart.routes.js');

module.exports.router = {
    authRouter,
    userRouter,
    cartRouter,
};
