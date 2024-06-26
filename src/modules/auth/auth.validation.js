const Joi = require('joi');
const { 
    systemRoles, 
    systemRequestsStatus
} = require('../../utils/systemValues.js');

module.exports.validator = {
    signUpSchema : {
        body: Joi.object({
            name: Joi.string().min(2).max(20).required().trim(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(11).required(),
            phoneNumber: Joi.string().length(11).required().trim(),
            // address: Joi.string().required().trim(),
        }),
    },

    vendorSignUpSchema: {
        body: Joi.object({
            name: Joi.string().min(2).max(20).required().trim(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(11).required(),
            phoneNumber: Joi.string().length(11).required().trim(),
            factoryName: Joi.string().min(2).max(20).required().trim(), 
            factoryAddress: Joi.string().required().trim(), 
            taxNumber: Joi.string().required().trim(),
            tradeMark: Joi.string().allow(""), 
            websiteLink: Joi.string().allow(""), 
            instagramLink: Joi.string().allow(""), 
            facebookLink: Joi.string().allow("")
        }),
    },

    verifyEmailSchema : {
        query: Joi.object({
            code: Joi.string().required(),
        }),
    },

    signInSchema : {
        body: Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(11).required(),
        }),
    },

    forgetPasswordSchema : {
        body: Joi.object({
            email: Joi.string().email().required(),
        }),
    },

    resetPasswordGetSchema: {
        params: Joi.object({
            code: Joi.string().required(),
        }),
    },
    
    resetPasswordSchema: {
        body: Joi.object({
            newPassword: Joi.string().min(6).max(11).required(),
        }),
        params: Joi.object({
            code: Joi.string().required(),
        }),
    },

    updatePasswordSchema : {
        body: Joi.object({
            currentPassword: Joi.string().min(6).max(11).required(),
            newPassword: Joi.string().min(6).max(11).required(),
        }),
    }
};