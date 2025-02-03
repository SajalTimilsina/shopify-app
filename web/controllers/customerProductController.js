import CustomerProduct from "../models/customerProductModel.js";
import Product from "../models/product.js";
import MasterList from "../models/masterlist.js";
import FavoriteList from "../models/favoriteList.js";


export const getCustomerProducts = async(req, res) => {
    try{
        const {customerID} = req.params;
        console.log(`Request the List: Customer ID: ${customerID}`);
        const customerProduct = await FavoriteList.findOne({customerId: customerID});
        console.log(`customerProduct: ${customerProduct}`);
        if(customerProduct){
            customerProduct.productList.sort((a, b) => {
                if (!a.product_type) return 1; // Push products without a type to the end
                if (!b.product_type) return -1;
                return a.product_type.localeCompare(b.product_type);
            });
            res.status(200).json(customerProduct);
            } else{
                res.status(404).json({message: "Product not found for this customer"});
            }
        }catch(error){
            console.error("Error fetching customer products:", error);
            res.status(500).json({message: "Internal server error"});
        }

};

export const addCustomerProduct = async(req, res) => {
    try{
        const {customerID} = req.params;
        const newProduct = req.body;

        const customerProduct = await CustomerProduct.findOne({customerId: customerID});

        if(customerProduct){
            // Check if the product already exists in the customer's product list
            const productExist =    customerProduct.productList.some(product => product.id === newProduct.id);
            if(productExist){
                res.status(400).json({message: "Product already exists in the customer's product list"});
            }
            customerProduct.productList.push(newProduct);
            await customerProduct.save();

            return res.status(201).json(customerProduct);
        }else{
            // If no CustomerProduct exists for the customer, create a new one
            const newCustomerProduct = new CustomerProduct({
                customerID,
                productList: [newProduct],
            });

            await newCustomerProduct.save();
            return res.status(201).json(newCustomerProduct);
        }
    }
    catch(error){
        console.error("Error adding product to customer:", error);
        res.status(500).json({message: "Internal server error"});
    }
};


export const deleteCustomerProduct = async(req, res) => {

    const {customerID, productID} = req.params;

    try{
        const customerProductList = await CustomerProduct.findOne({customerID});

            if(customerProductList){
                const updatedProductList = customerProductList.productList.filter(product => product.id !== productID);

                if(updatedProductList.length === customerProductList.productList.length){
                    return res.status(404).json({message: "Product not found in the customer's product list"});
                }

                customerProductList.productList = updatedProductList;
                await customerProductList.save();
                return res.status(200).json({message: "Product deleted from customer's product list"});
            }
    }catch(error){
        console.error("Error deleting product from customer:", error);
        return res.status(500).json({message: "Internal server error"});
    }

}

export const getAllProducts = async(req,res) => {
    const session = res.locals.shopify.session;
    const {search, page=1, limit = 20, profession= null} = req.query;
    const query = {storeName: session.shop};
    
    try{
        if(search){
            query.title = {$regex: search, $options: 'i'}; // case insensitive search
        }

        const productList = await Product.find(query)
        .limit(parseInt(limit))
        .skip((page -1 ) * limit);

        if(!productList){
            return res.status(404).json({message : "No products found for this shop"});
        }

        // Count total number of products for pagination
        const totalProducts = await Product.countDocuments(query);

        // If the API has the profession query parameter, filter the products by profession
       
        let includedList = [];
        if(profession){
            const masterList = await MasterList.find({profession, storeId: `offline_${session.shop}`});
        
            if(masterList.length > 0){
                console.log(" ### Got MasterList length: ", masterList[0].products.length);
            }
        
        // // Check if masterList exists and its products array is valid
        // if (masterList && masterList.length && masterList[0].products.length > 0) {
        //     includedList = productList.map(product => {
        //         // Check if the variant  ID exists in the master list's products
        //       const variantsWithInclusion = product.variants.map(varaint => {
        //         const isIncluded = masterList[0].products.some(productId => productId === varaint.id);
        //         return {...varaint.toObject(), included: isIncluded};
        //       })
        //       return {
        //         ...product.toObject(),
        //         variants: variantsWithInclusion
        //       };

        //     });
        // } else {
        //     // If there's no masterlist or no products, mark all products as not included
        //     includedList = productList.map(product => ({
        //         ...product.toObject(),
        //         variants: product.variants.map(varaint => ({...varaint.toObject(), included: false}))
        //     }));
        // }

        const favoriteList = await FavoriteList.find({listName: profession, storeId: `offline_${session.shop}`});
        //console.log("### FavoriteList: ", favoriteList);
        if(favoriteList.length > 0){
            //console.log(" ### Got FavoriteList length: ", favoriteList[0].products.length);
        }
        // Check if favoriteList exists and its products array is valid
        //console.log("FavoriteList: ", favoriteList);
       // console.log(productList);
        if(favoriteList && favoriteList.length && favoriteList[0].products.length > 0){
            includedList = productList.map(product => {
                // check if variant Ids exist in the favorite list's products
                const varaintsArrayWithInclusion = product.variants.map(variant => {
                    const favoriteProduct = favoriteList[0].products.find(v => v.variantId === variant.id);
                    //console.log("### isIncluded: ", favoriteProduct);
                    const isIncluded = !!favoriteProduct;
                    return {
                        ...variant.toObject(), 
                        included: isIncluded,
                        quantity: favoriteProduct ? favoriteProduct.quantity : 1
                    };

                    // const isIncluded = favoriteList[0].products.some(v => v.variantId === variant.id);
                    // console.log("### isIncluded: ", isIncluded);
                    // return {...variant.toObject(), included: isIncluded};
                })
                //return varaintsArrayWithInclusion;
                return { ...product.toObject(), variants: varaintsArrayWithInclusion};
            })
        } else {
            // if there is no favorite list or no products, mark all products as not included
            includedList = productList.map(product => ({
                ...product.toObject(),
                varaints: product.variants.map(v => ({...v.toObject(), included: false}))
            }));
        }



    }else {
            // If there's no masterlist or no products, mark all products as not included
            includedList = productList.map(product => ({
                ...product.toObject(),
                variants: product.variants.map(varaint => ({...varaint.toObject(), included: false}))
            }));
        }
        
        res.status(200).json({
            productList : includedList,
            totalPages: Math.ceil(totalProducts /limit),
            currentPage: parseInt(page)
        });
    }catch(error){
    console.error("Error fetching products:", error);
    res.status(500).json({message: "Internal server error"});   
}

} 