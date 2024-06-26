const { systemRoles } = require('../../utils/systemValues.js');
module.exports.accessRoles = {
    TO_CATEGORY: [
        systemRoles.SUPER_ADMIN
    ],

    GET_CATEGORY: [
        systemRoles.SUPER_ADMIN,
        systemRoles.ADMIN,
        systemRoles.VENDOR,
        systemRoles.USER,
    ]
}