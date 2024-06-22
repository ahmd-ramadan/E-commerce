const Joi = require('joi');
const {objectIdValidation} = require('../../utils/index.js');

module.exports.validator = {
    updateUserProfileScheam: {
        body: Joi.object({
            name: Joi.string().min(2).max(10).trim().required(),
            email: Joi.string().email().required(),
            phoneNumbers: Joi.array().required().items(Joi.string().length(11).trim()),
            addresses: Joi.array().items(Joi.string().trim()),
        }),

        deleteUserSchema: {
            userId: Joi.string().custom(objectIdValidation).required(),
        }
    } 
}