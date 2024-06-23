const router = require('express').Router();
const authCtrl = require('./auth.controller');
const asyncHandler = require('../../middlewares/asyncHandler.middleware.js');
const {validator} = require('./auth.validation');
const {validate} = require('../../middlewares/validation.middleware.js');
const {auth} = require('../../middlewares/auth.middleware.js');
const {accessRoles} = require('./auth.access.js');

router.post(
    '/signup', 
    validate(validator.signUpSchema), 
    asyncHandler(authCtrl.signUp)
);

router.post(
    '/vendor-signup', 
    validate(validator.vendorSignUpSchema),
    asyncHandler(authCtrl.vendorSignUp)
);

router.get(
'/verify-email', 
    validate(validator.verifyEmailSchema), 
    asyncHandler(authCtrl.verifyEmail)
);

router.post(
    '/login', 
    validate(validator.signInSchema),
    asyncHandler(authCtrl.signIn)
);

router.post(
    "/forget-password",
    validate(validator.forgetPasswordSchema),
    asyncHandler(authCtrl.forgetPassword)
);

router.get(
    "/reset-password/:token",
    validate(validator.resetPasswordGetSchema),
    asyncHandler(authCtrl.resetPasswordGet)
);

router.post(
    "/reset-password/:token",
    validate(validator.resetPasswordSchema),
    asyncHandler(authCtrl.resetPassword)
);

router.post(
    "/update-password",
    auth(accessRoles.UPDATE_PASSWORD),
    validate(validator.updatePasswordSchema),
    asyncHandler(authCtrl.updatePassword)
);

module.exports = router;