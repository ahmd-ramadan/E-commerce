const router = require('express').Router();
const {categoryCtrl} = require('./category.controller.js')
const {accessRoles} = require('./category.access.js');
const {validator} = require('./category.validation.js'); 

const {auth} = require('../../middlewares/auth.middleware.js');
const {validate} = require('../../middlewares/validation.middleware.js');
const {asyncHandler} = require('../../middlewares/asyncHandler.middleware.js');
const {multerMiddleHost} = require('../../middlewares/multer.middleware.js');

router.route('/')
    .post(
        auth(accessRoles.TO_CATEGORY),
        multerMiddleHost({}).single("image"),
        validate(validator.addCategorySchema),
        asyncHandler(categoryCtrl.addCategory)
    )

    .get(
        auth(accessRoles.GET_CATEGORY),
        validate(validator.getCategorySchema),
        asyncHandler(categoryCtrl.getAllCategoriesWithSubCategories)
    )

router.route('/:categoryId')
    .get(
        auth(accessRoles.GET_CATEGORY),
        validate(validator.getCategorySchema),
        asyncHandler(categoryCtrl.getCategoryById)
    )

    .put(
        auth(accessRoles.TO_CATEGORY),
        multerMiddleHost({}).single("image"),
        validate(validator.updateCategorySchema),
        asyncHandler(categoryCtrl.updateCategory)
    )

    .delete(
        auth(accessRoles.TO_CATEGORY),
        validate(validator.deleteCategorySchema),
        asyncHandler(categoryCtrl.deleteCategory)
    );

router.get(
    "/subCategory/:categoryId",
    validate(validator.getCategorySchema),
    asyncHandler(categoryCtrl.getAllSubCategoriesForCategory)
);

module.exports = router;