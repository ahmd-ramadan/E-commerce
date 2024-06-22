const {systemRoles} = require('../../utils/systemValues');

module.exports.accessRoles = {
    GET_PROFILE: [
        systemRoles.USER,
        systemRoles.VENDOR,
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ],
    UPDATE_PROFILE: [
        systemRoles.USER,
        systemRoles.VENDOR,
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ],

}