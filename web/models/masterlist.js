import mongoose from "mongoose";

const masterListSchema = new mongoose.Schema({
    storeId: { type: String, required: true},
    profession: { type: String, required: true},
    products: { type: [Number], required: true }, // Array of the products / Linked master list based on profession  
});

export default mongoose.model('MasterList',masterListSchema);