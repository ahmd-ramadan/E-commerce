const slugify = require('slugify');

const Category = require('../../../database/models/Category.js');
const SubCategory = require('../../../database/models/SubCategory.js');
const Brand = require('../../../database/models/Brand.js');
const Product = require('../../../database/models/Product.js');
const Review = require('../../../database/models/Review.js');

const {generateUniqueString} = require('../../utils/auth.js');
const {cloudinaryConnection} = require('../../utils/cloudinary.js');

module.exports.categoryCtrl = {
	addCategory:
		async (req, res, next) => {
			const { name } = req.body;
			const { _id } = req.authUser;
			
			//! Check if category name is already exists
			const isNameExist = await Category.findOne({ name });
			if (isNameExist) {
				return next(new Error("Category name is already exists ", { status: 409 }));
			}

			//! Genrate the slug
			const slug = slugify(name);

			//! Upload image to cloudinary
			if (!req.file) {
				return next(new Error("Image is required", { status: 400 }));
			}

			const folderId = generateUniqueString();
			const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
				folder: `${process.env.CLOUDAINARY_MAIN_FOLDER}/Categories/${folderId}`,
			});

			req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`;

			//! Generate the category object
			const category = {
				name,
				slug,
				Image: { secure_url, public_id },
				folderId,
				addedBy: _id,
			};
	
			//! Create category
			const createCategory = await Category.create(category);
			req.savedDocument = { model: Category, _id: createCategory._id };
			if (!createCategory) {
				return next(new Error("Category creation failed!", { casue: 400 }));
			}

			//! Send response
			res.status(201).json({
				succes: true,
				data: { createCategory },
				message: "Category created successfully!",
			})
		},

	updateCategory:
		async (req, res, next) => {
			//! Destructuring the request body, params, authUser
			const { name, oldPublicId } = req.body
			const { categoryId } = req.params;
			const { _id } = req.authUser;

			//! Check if the category is exist by using categoryId
			const category = await Category.findById(categoryId);
			if (!category) {
				return next(new Error("Category not found", { status: 404 }));
			}
			//! Check if the use want to update the name field
			if (name) {
				if(name !== category.name) {
					//! Check if the new category name is already exist
					const isNameExist = await Category.findOne({ name });
					if(isNameExist) {
						return next(new Error("Category name is already exist", { status: 409}));
					}
					//! Update the category name and the category slug
					category.name = name;
					category.slug = slugify(name, "-");
				}
			}

			//! Check if the user want to update the image
			if (oldPublicId) {
				if(!req.file) {
					return next(new Error("Image is required", { status: 400 }));
				}
				const newPublicId = oldPublicId.split(`${category.folderId}/`)[1];
				console.log(newPublicId);
				const { secure_url } = await cloudinaryConnection().uploader.upload(
					req.file.path,
					{
						folder: `${process.env.CLOUDAINARY_MAIN_FOLDER}/Categories/${category.folderId}`,
						public_id: newPublicId,
					}
				);

				category.Image.secure_url = secure_url;
			}

			//! Set value for the updatedBy field
			category.updatedBy = _id;		
			await category.save();

			//! Send response
			res.status(200).json({
				success: true,
				data: category,
				message: "Category updated successfully",
			});
		},

	deleteCategory: 
		async (req, res, next) => {
			const { categoryId } = req.params;
			
			//! Delete category
			const catgory = await Category.findByIdAndDelete(categoryId);
			if (!catgory) return next(new Error("Category not found", {status: 404}));
		
			//! Delete the related subcategories
			const subCategories = await SubCategory.deleteMany({ categoryId });
			if (subCategories.deletedCount <= 0) {
					console.log("There is no related subcategories");
			}
		
			//! Delete the related brands
			const brands = await Brand.deleteMany({ categoryId });
			if (brands.deletedCount <= 0) {
					console.log("There is no related brands");
			}
		
			//! Delete the related products
			const products = await Product.deleteMany({ categoryId });
			if (products.deletedCount <= 0) {
					console.log("There is no related prodcuts");
			}	
			//Delete the related reviews
			const reviews = await Review.deleteMany({ categoryId });
			if (reviews.deletedCount <= 0) {
				console.log("There is no related reviews");
			}
			//! Check it
			try {
				//! Delete the category folder from cloudinary
				const folderPath = `${process.env.CLOUDAINARY_MAIN_FOLDER}/Categories/${catgory.folderId}`;
				await cloudinaryConnection().api.delete_resources_by_prefix(folderPath);					await cloudinaryConnection().api.delete_folder(folderPath);
			} catch(err) {
				console.log(err);
			}

			res.status(200).json({ 
				success: true, 
				data: null,
				message: "Category deleted successfully" 
			});
		},

	getCategoryById:
		async(req, res, next) => {
			const { categoryId } = req.params;

			//! Get all sub category for that category
			const category = await Category.findById(categoryId);
			if (!category) {
					return next(new Error("Category not found!", { status: 404 }));
			}

			//! Send response
			res.status(200).json({
					success: true,
					data: category,
					message: ""
			});
		},

	getAllSubCategoriesForCategory: 
		async(req, res, next) => {
			const { categoryId } = req.params;
			
			const subCategories = await SubCategory.find({ categoryId });
			if (!subCategories.length) {
					return next(new Error("There are no subCategories yet!", { status: 400 }));         			}
			
					//! Send response
			res.status(200).json({
					success: true,
					data: subCategories,
					message: "SubCategories for This Categories fetched successfully",
			});
		},
			
	getAllCategoriesWithSubCategories:
		async (req, res, next) => {
			const categories = await Category.find().populate([{
				path: "subCategories",
			}]);

			if (!categories.length) {
				return next(new Error("There are no categories yet!", { status: 400 }));
			}

			//! Send response
			res.status(200).json({
				success: true,
				data: categories,
				message: "Categories fetched successfully",
			});
		},
}