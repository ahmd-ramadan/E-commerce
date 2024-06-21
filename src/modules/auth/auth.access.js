const {systemRoles} = require('../../utils/systemValues.js');

module.exports.accessRoles = {
    UPDATE_PASSWORD: [
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN,
        systemRoles.USER,
        systemRoles.VENDOR,
    ],
    VENDOR_HNDLE_REQUEST: [
        // systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN,
    ],
};
