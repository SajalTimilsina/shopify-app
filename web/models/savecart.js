import mongoose from "mongoose";

const saveCartSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    storeId: {type: String, required: true},
    products: [{
        variantId : {type: String, required: true},
        quanntity: {type: Number, default: 1}
    }],
    draftOrderIds: {type: [String],
    date: {type: Date, default: Date.now}
    }
});

export default mongoose.model("SaveCart", saveCartSchema);