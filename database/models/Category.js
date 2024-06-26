const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true, 
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
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

//! Virtual populate for subCategories model
categorySchema.virtual("subCategories", {
    ref: "SubCategory",
    localField: "_id",
    foreignField: "categoryId",
});

module.exports = mongoose.model("Category", categorySchema);
