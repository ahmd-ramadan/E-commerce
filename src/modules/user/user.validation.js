const Joi = require('joi');
const {
    systemRequestsStatus
} = require('../../utils/systemValues.js');
const systemRequestsStatusArray = Object.values(systemRequestsStatus);
const {validateObjectId} = require('../../utils/auth.js');

module.exports.validator = {
    updateUserProfileScheam: {
        body: Joi.object({
            name: Joi.string().min(2).max(10).trim().required(),
            email: Joi.string().email().required(),
            phoneNumbers: Joi.array().required().items(Joi.string().length(11).trim()),
            addresses: Joi.array().items(Joi.string().trim()),
        }),
    },

    deleteUserSchema: {
        query: Joi.object({
            userId: Joi.string().custom(validateObjectId).required(),
        }),
    },
    
    vendorHandleRequestSchema: {
        body: Joi.object({
            requestId: Joi.string().custom(validateObjectId).required(),      // Validate MongoDB ObjectId format
            status: Joi.string().valid(...systemRequestsStatusArray).required(), 
        }),
    },
}