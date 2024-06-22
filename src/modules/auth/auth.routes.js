const router = require('express').Router();
const authCtrl = require('./auth.controller');
const {validator} = require('./auth.validation');
const {validate} = require('../../middlewares/validation.middleware.js');
const {auth} = require('../../middlewares/isAuth.js');
const {accessRoles} = require('./auth.access.js');

router.post('/signup', 
    validate(validator.signUpSchema), 
    authCtrl.signUp);

router.post('/vendor-signup', 
    validate(validator.vendorSignUpSchema),
    authCtrl.vendorSignUp);

router.post('/vendor-handle-request', 
    validate(validator.vendorHandleRequestSchema),
    auth(accessRoles.VENDOR_HNDLE_REQUEST),
    authCtrl.vendorHandleRequest);

    
router.get('/verify-email', 
    validate(validator.verifyEmailSchema), 
    authCtrl.verifyEmail);

router.post('/login', 
    validate(validator.signInSchema),
    authCtrl.signIn);

router.post("/forget-password",
    validate(validator.forgetPasswordSchema),
    authCtrl.forgetPassword);

router.get("/reset-password/:token",
    validate(validator.resetPasswordGetSchema),
    authCtrl.resetPasswordGet);

router.post("/reset-password/:token",
    validate(validator.resetPasswordSchema),
    authCtrl.resetPassword);

router.post("/update-password",
    auth(accessRoles.UPDATE_PASSWORD),
    validate(validator.updatePasswordSchema),
    authCtrl.updatePassword);

module.exports = router;