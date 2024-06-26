const router = require('express').Router();
const {cartCtrl} = require('./cart.controller.js')
const {accessRoles} = require('./cart.access.js');
const {validator} = require('./cart.validation.js'); 

const {auth} = require('../../middlewares/auth.middleware.js');
const {validate} = require('../../middlewares/validation.middleware.js');
const {asyncHandler} = require('../../middlewares/asyncHandler.middleware.js');


router.route('/')
    .get(
        auth(accessRoles.TO_CART),
        asyncHandler(cartCtrl.getUserCart)
    )

    .post(
        auth(accessRoles.TO_CART),
        validate(validator.addToCartSchema),
        asyncHandler(cartCtrl.addToCart)
    )

    .delete(
        auth(accessRoles.TO_CART),
        asyncHandler(cartCtrl.deleteUserCart)
    );

router.put(
    '/:productId',
    auth(accessRoles.TO_CART),
    validate(validator.removeFromCartSchema),
    asyncHandler(cartCtrl.removeFromCart)
);



module.exports = router;