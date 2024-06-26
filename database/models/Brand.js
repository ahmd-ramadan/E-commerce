const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brandSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        // unique: true,
        trim: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    Image: {
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
    folderId: { 
        type: String,
        required: true, 
        unique: true 
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
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
},
{
    timestamps: true,
    toJSON:{ virtuals:true },
    toObject:{ virtuals:true }
});

brandSchema.virtual("products",{
    ref:"Product",
    localField:"_id",
    foreignField:"brandId"
})

module.exports = mongoose.model("Brand", brandSchema);
