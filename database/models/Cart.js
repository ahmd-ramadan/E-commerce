const mongoose = require('mongoose');
const {
    model, 
    Schema
} = mongoose.Schema;

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
            basePrice: {
                type: Number,
                required: true,
                default: 0,
            },
            finalPrice: {
                type: Number,
                required: true,
            }
        },
    ],
    subTotal: {
        type: Number,
        required: true,
        default: 0,
    },
},
{
    timestamps: true,
});

module.exports = model("Cart", cartSchema);
