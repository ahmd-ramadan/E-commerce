const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
    },
    brandId: { 
        type: Schema.Types.ObjectId, 
        ref: "Brand", 
        required: true 
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    reviewRate: {
        type: Number,
        min: 1,
        max: 5,
        enum: [1, 2, 3, 4, 5],
        required: true,
    },
    reviewComment: { type: String },
},
{ 
    timestamps: true 
});

module.exports = mongoose.model("Review", reviewSchema);