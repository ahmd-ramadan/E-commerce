const mongoose = require('mongoose');
const {
    model, 
    Schema
} = mongoose.Schema;

const { 
    systemRequests,
    systemRequestsStatus
} = require('../../src/utils/systemValues.js');

const typeToModelMap = {
    [systemRequests.BE_VENDOR]: 'Vendor',
    // [systemRequests.ADD_PRODUCT]: 'Product',
};

const requestSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    desc: {
        type: String,
    },
    type: {
        type: String,
        enum: Object.values(systemRequests),
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    data: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "dataRef",
    },
    status: {
        type: String, 
        enum: Object.values(systemRequestsStatus), 
        default: systemRequestsStatus.PENDING
    },

}, 
{ 
    timestamps: true 
});

requestSchema.virtual('dataRef').get(function() {
    return typeToModelMap[this.type];
});

module.exports = model('Request', requestSchema);
