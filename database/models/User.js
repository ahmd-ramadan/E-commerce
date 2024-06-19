const mongoose = require('mongoose');
const { systemRoles } = require('../../src/utils/system-enums.js');

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
    age: {
        type: Number,
        min: 16,
        max: 100,
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    forgetCode: {
        type: String,
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);

