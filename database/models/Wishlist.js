const mongoose = require('mongoose');
const {
    model, 
    Schema
} = mongoose.Schema;

const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, 
{
    timestamps: true
});

module.exports = model('Wishlist', wishlistSchema);
