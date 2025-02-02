import mongoose from "mongoose";

const favoriteListSchema = new mongoose.Schema({
    listName: {type: String, required: true},
    storeId: { type: String, required: true},

    // link to the customer ID
    customerId: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer'
    }],
    isPrimary: {type: Boolean, default: false},
    
    // We will update the products arry with mongoose schema later --------------------
    products: [{
        variantId: { type: Number,},
        quantity: {type: Number, default: '1'},
    }],
    isMasterList: {type: Boolean, default: false},

    // Track reference to external priclist, so you can update/delete later
    externalPriceListId: { type: Number, default: null},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
})



// favoriteListSchema.path('products').validate(function(products){
//     console.log(" ######### i am inside the validate function ##########");
//     const variantIds = products.map(product => product.variantId);
//     const uniqueVariantIds = new Set(variantIds);
//     console.log("uniqueVariantIds", uniqueVariantIds);
//     console.log("variantIds", variantIds);
//     console.log(`variant number ${variantIds.length} unique variant number ${uniqueVariantIds.size}`);
//     const data = variantIds.length === uniqueVariantIds.size;
//     console.log("Data: ", data);
//     return data;
// }, 'Duplicate variantId in the product list');



// favoriteListSchema.pre('save', function(next){
//     console.log("I am called before save");
//     const variantIds = this.products.map(product => product.variantId);
//     const uniqueVariantids = new Set(variantIds);
//     if(variantIds.length !== uniqueVariantids.size){
//         next(new Error('Duplicate variantId in the product list'));
//     }
//     next();
// })

export default mongoose.model.FavoriteList || mongoose.model('FavoriteList', favoriteListSchema);
