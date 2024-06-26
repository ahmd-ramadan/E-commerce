const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { systemRoles } = require('../../src/utils/systemValues.js');
// const { systemPermissions } = require('../../src/utils/systemValues.js');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(systemRoles),
        default: systemRoles.USER,
    },
    // permissions: [
    //     {
    //         type: String,
    //         enum: Object.values(systemPermissions),
    //     }
    // ],
    addresses: [
        { 
            type: String, 
            require: true 
        }
    ],
    phoneNumbers: [
        {
            type: String,
            required: true,
        }
    ],
    confirmEmail: {
        type: Boolean,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String,
    },
    forgetCode: {
        type: String,
    },
}, 
{ 
    timestamps: true 
});


module.exports = mongoose.model('User', userSchema);
