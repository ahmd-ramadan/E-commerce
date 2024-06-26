const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
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

module.exports = mongoose.model('Wishlist', wishlistSchema);
