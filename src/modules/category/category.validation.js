const Joi = require('joi');
const {validateObjectId} = require('../../utils/auth.js');

module.exports.validator = {
    addCategorySchema: {
        body: Joi.object({
            name: Joi.string().required().min(3).max(20).alphanum()
        })
    },

    updateCategorySchema: {
        params: Joi.object({
            categoryId: Joi.string().custom(validateObjectId).trim(),
        }),

        body: Joi.object({
            oldPublicId: Joi.string().optional(),
            name: Joi.string().optional().min(3).max(20).alphanum()
        }),
    },

    deleteCategorySchema: {
        params: Joi.object({
            categoryId: Joi.string().custom(validateObjectId).trim(),
        }),
    },

    getCategorySchema: {
        params: Joi.object({
            categoryId: Joi.string().custom(validateObjectId).trim(),
        }),
    },

}