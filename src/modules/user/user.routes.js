const router = require('express').Router();
const userCtrl = require('./user.controller');
const {validator} = require('./user.validation');
const {validate} = require('../../middlewares/validation.middleware.js');
const {auth} = require('../../middlewares/isAuth.js');
const {accessRoles} = require('./user.access.js');

router.get('/',
    auth(accessRoles.GET_PROFILE),
    userCtrl.getUserProfile);

router.put('/',
    validate(validator.updateUserProfileScheam),
    auth(accessRoles.UPDATE_PROFILE),
    userCtrl.updateUserProfile);

router.delete(
    "/",
    auth(accessRoles.DELETE_USER),
    validate(validator.deleteUserSchema),
    userCtrl.deleteUser
);

router.patch(
    "/",
    auth(accessRoles.DELETE_USER),
    validate(validator.deleteUserSchema),
    userCtrl.softDeleteUser);

module.exports = router;