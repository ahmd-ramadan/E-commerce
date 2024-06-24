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
    DELETE_USER: [
        systemRoles.USER,
        systemRoles.VENDOR,
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN
    ],
    VENDOR_HNDLE_REQUEST: [
        // systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN,
    ],

}