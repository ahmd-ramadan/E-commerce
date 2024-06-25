const Joi = require('joi');
const {validateObjectId} = require('../../utils/auth.js');

module.exports.validator = {
    addToWishlistSchema: {
        body: Joi.object({
            productId: Joi.string().custom(validateObjectId).required(),
        })
    },

    removeFromWishlistSchema: {
        params: Joi.object({
            productId: Joi.string().custom(validateObjectId).required()
        })
    }
}