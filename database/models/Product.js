const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    desc: { type: String },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    folderId: { 
        type: String, 
        required: true, 
        unique: true 
    },

    basePrice: { 
        type: Number, 
        required: true 
    },
    discount: { 
        type: Number, 
        default: 0 
    },
    appliedPrice: { 
        type: Number, 
        required: true 
    },
    stock: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    rate: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5
    },

    Images: [
        {
            secure_url: { 
                type: String, 
                required: true 
            },
            public_id: {
                type: String, 
                required: true, 
                unique: true 
            },
        },
    ],
    
    specs: {
        type: Map,
        of: [String | Number],
    },

    addedBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    updatedBy: {   
        type: Schema.Types.ObjectId, 
        ref: "User" 
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
},
{  
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

productSchema.virtual("reviews",{
    ref: "Review",
    localField: "_id",
    foreignField: "productId"
})

module.exports = mongoose.model("Product", productSchema);
