const mongoose = require('mongoose');

const prouductSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Product', prouductSchema);
