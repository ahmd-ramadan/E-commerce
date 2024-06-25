const mongoose = require('mongoose');
const {
    model, 
    Schema
} = mongoose.Schema;

const temporaryUserSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String,
        required: true
    },
    password: { 
        type: String, 
        required: true 
    },
    phoneNumber: { 
        type: String, 
        required: true 
    },
    role: {
        type: String, 
        required: true 
    },
    factoryName: { type: String },
    factoryAddress: { type: String },
    taxNumber: { type: String },
    tradeMark: { type: String },
    websiteLink: { type: String },
    instagramLink: { type: String },
    facebookLink: { type: String },
    activationCode: { type: String, required: true }
},
{ 
    timestamps: true
});

module.exports = model('TemporaryUser', temporaryUserSchema);

