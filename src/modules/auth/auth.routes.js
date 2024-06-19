const router = require('express').Router();
const authCtrl = require('./auth.controller');
const {validator} = require('./auth.validation-schemas');
const {validate} = require('../../middlewares/validation.middleware.js');
const {isAuth} = require('../../middlewares/isAuth.js');

router.post('/signup', 
    validate(validator.signUpSchema), 
    authCtrl.signUp);

router.get('/activate', 
    validate(validator.verifyEmailSchema), 
    authCtrl.verifyEmail);

router.post('/signin', 
    validate(validator.signInSchema),
    authCtrl.signIn);

router.post("/forget",
    validate(validator.forgetPasswordSchema),
    authCtrl.forgetPassword);

router.post("/reset/",
    validate(validator.resetPasswordSchema),
    authCtrl.resetPassword);

router.post("/updatePassword",
    isAuth,
    validate(validator.updatePasswordSchema),
    authCtrl.updatePassword);

module.exports = router;