import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    storeId: {type: String, required: true},
    id: {
        type: String,
        required: true,
        unique: true
    },
    gid: {
        type: String,
        required: true,
    },
    name: {
        type : String,
        required: true
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    predictedSpendTier: {
        type: String,
    },
    tags: {
        type: [String],
    },
    profession: { 
        type: String,
    },
    masterList:{type: [String]}, // Linked master list based on profession
    createdAtShopify: { type: Date, required: true },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

});

export default mongoose.model('Customer', customerSchema);