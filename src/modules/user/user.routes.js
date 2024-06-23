const router = require('express').Router();
const userCtrl = require('./user.controller');
const asyncHandler = require('../../middlewares/asyncHandler.middleware.js');
const {validator} = require('./user.validation');
const {validate} = require('../../middlewares/validation.middleware.js');
const {auth} = require('../../middlewares/auth.middleware.js');
const {accessRoles} = require('./user.access.js');


router.get(
    '/',
    auth(accessRoles.GET_PROFILE),
    asyncHandler(userCtrl.getUserProfile)
);

router.put(
    '/',
    auth(accessRoles.UPDATE_PROFILE),
    validate(validator.updateUserProfileScheam),
    asyncHandler(userCtrl.updateUserProfile)
);

router.delete(
    '/',
    auth(accessRoles.DELETE_USER),
    validate(validator.deleteUserSchema),
    asyncHandler(userCtrl.deleteUser)
);

router.patch(
    '/',
    auth(accessRoles.DELETE_USER),
    validate(validator.deleteUserSchema),
    asyncHandler(userCtrl.softDeleteUser)
);

router.post(
    '/vendor-request-handle', 
    auth(accessRoles.VENDOR_HNDLE_REQUEST),
    validate(validator.vendorHandleRequestSchema),
    asyncHandler(userCtrl.vendorHandleRequest)
);

module.exports = router;