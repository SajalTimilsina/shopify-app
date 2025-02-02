import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    product_id: {
        type: Number,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    sku:{
        type: String,
        required: true          
    },
    title: {
        type: String,
        required: true
    }

});


const productSchema = new mongoose.Schema({
    storeId:{
        type: String,
        required: true
    },
    storeName:{
        type: String,
        required: true,
    },
    id:{
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    vendor: {
        type: String,
        required: true
    },
    product_type: {
        type: String,
    },
    handle: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
    },
    variants: {
        type: [variantSchema], 
        required: true
    },  
    images: {type: [String]}

});

// const productMainSchema = new mongoose.Schema({
//     storeId: { type: String, required: true},
//     storeName: { type: String, required: true},
//     productList: {
//         type: [productSchema],
//         required: true
//     }
// })

export default mongoose.model("Product", productSchema);

