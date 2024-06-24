const Joi = require('joi');
const {validateObjectId} = require('../../utils/auth.js');

module.exports.validator = {
    addToCartSchema: {
        body: Joi.object({
            productId: Joi.string().custom(validateObjectId).required(),
            quantity: Joi.number().integer().min(1).required(),
        })
    },

    removeFromCartSchema: {
        params: Joi.object({
            productId: Joi.string().custom(validateObjectId).required()
        })
    }
}