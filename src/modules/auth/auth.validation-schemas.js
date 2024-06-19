const Joi = require('joi');
const { systemRoles } = require('../../utils/system-enums.js');

module.exports.validator = {
    signUpSchema : {
        body: Joi.object({
            name: Joi.string().min(2).max(20).required().trim(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(11).required(),
            phoneNumbers: Joi.array().required()
                .items(Joi.string().length(11).required().trim()),
            // addresses: Joi.array().required().items(Joi.string().required().trim()),
            age: Joi.number().required().max(100).min(16),
            role: Joi.string()
            .valid(
                systemRoles.ADMIN,
                systemRoles.USER
            )
            .default(systemRoles.USER),
        }),
    },

    verifyEmailSchema : {
        query: Joi.object({
            token: Joi.string().required(),
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

    resetPasswordSchema: {
        body: Joi.object({
            newPassword: Joi.string().min(6).max(11).required(),
        }),
        query: Joi.object({
            token: Joi.string().required(),
        }),
    },

    updatePasswordSchema : {
        body: Joi.object({
            currentPassword: Joi.string().min(6).max(11).required(),
            newPassword: Joi.string().min(6).max(11).required(),
        }),
    }
};