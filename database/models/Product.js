const mongoose = require('mongoose');
const {
    model, 
    Schema
} = mongoose.Schema;

const prouductSchema = new Schema({
    title: {
        type: String,
    },
    appliedPrice: {
        type: Number,
    },
    stock: {
        type: Number,
        min: 1
    }
},
{
    timestamps: true,
});

module.exports = model('Product', prouductSchema);
