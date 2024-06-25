const mongoose = require('mongoose');
const {
    model, 
    Schema
} = mongoose.Schema;
const { systemRoles } = require('../../src/utils/systemValues.js');

const vendorSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    factoryName: {
        type: String,
        required: true
    },
    factoryAddress: {
        type: String,
        required: true,
    },
    taxNumber: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    tradeMark: {
        type: String, 
    },
    websiteLink: {
        type: String,
    },
    instagramLink: {
        type: String,
    },
    facebookLink: {
        type: String,
    }
}, 
{ 
    timestamps: true 
});


module.exports = model('Vendor', vendorSchema);
