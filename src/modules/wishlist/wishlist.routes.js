const router = require('express').Router();
const {wishlistCtrl} = require('./wishlist.controller.js')
const {accessRoles} = require('./wishlist.access.js');
const {validator} = require('./wishlist.validation.js'); 

const {auth} = require('../../middlewares/auth.middleware.js');
const {validate} = require('../../middlewares/validation.middleware.js');
const {asyncHandler} = require('../../middlewares/asyncHandler.middleware.js');


router.get(
    '/',
    auth(accessRoles.TO_WISHLIST),
    asyncHandler(wishlistCtrl.getUserWishlist)
);

router.post(
    '/',
    auth(accessRoles.TO_WISHLIST),
    validate(validator.addToWishlistSchema),
    asyncHandler(wishlistCtrl.addToWishlist)
);

router.put(
    '/:productId',
    auth(accessRoles.TO_WISHLIST),
    validate(validator.removeFromWishlistSchema),
    asyncHandler(wishlistCtrl.removeFromWishlist)
);

router.delete(
    '/',
    auth(accessRoles.TO_WISHLIST),
    asyncHandler(wishlistCtrl.deleteUserWishlist)
);

module.exports = router;