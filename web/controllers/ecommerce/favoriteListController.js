import FavoriteList from "../../models/favoriteList.js";
import Product from "../../models/product.js";
import Customer from "../../models/customer.js";
import MasterList from "../../models/masterlist.js";

// Get the list of products from master list or favorite list
// Application checks if the list if in customer master list profile, it will fetch from master list
// else it fetch from favorite List
export const getListProducts = async(req, res) => {
    let {customerId, listName} = req.params;
    let { search, shop, minPrice, maxPrice, sort, order, page = 1, limit = 10 } = req.query;
    console.log("### Search Param:", search);
    console.log('### listName:', listName);

    //pagination settings
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    customerId = parseInt(customerId);
    listName = listName.trim();
    if(!customerId || !listName || !shop){ res.status(400).json({message: "Missing required parameters: Customer ID: ${customerId}, List Name: ${listName}, storeId: ${storeId}, search: ${search}"}); return; }
    const storeId = `offline_${shop}`;
    console.log(`Request the Product List: Customer ID: ${customerId}, List Name: ${listName}, storeId: ${storeId}, search: ${search}`);

    // Construct the search condition
    const searchCondition = [];
    if(search){
        searchCondition.push({
            $or: [
                {"productDetails.title": {$regex: search, $options: 'i'}}, //Search in title
                {"productDetails.vendor": {$regex: search, $options: 'i'}}, //Search in vendor
                {"productDetails.variants.sku": {$regex: search, $options: 'i'}} //Search in SKU
            ]
        })
    }
    console.log(searchCondition);
    const checkListisFromMasterList = await Customer.findOne({customerId, storeId, masterList: listName});
    
    if(checkListisFromMasterList){
        try{
        
            const masterPipeLine = [
                {
                    $match: { storeId, profession: listName}
                },
                {
                    $unwind: "$products"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "products",
                        foreignField: "variants.id",
                        as: "productDetails"
                    }
                },
                {
                    $unwind: "$productDetails"
                },
                {
                    $project: {
                        _id: 0,
                        id: "$productDetails.id",
                        variantId: { $arrayElemAt: ["$productDetails.variants.id", 0]}, //Get the varint Id
                        title: "$productDetails.title",
                        variantTitle: { $arrayElemAt: ["$productDetails.variants.title", 0]}, //Get the variant title
                        vendor: "$productDetails.vendor",
                        sku: { $arrayElemAt: ["$productDetails.variants.sku", 0] }, // Get the specific SKU of the matched variant // the value is still array with single object so that we have to extract the data as array
                        price: { $arrayElemAt: ["$productDetails.variants.price", 0] }, // Get the specific price of the matched variant
                        productType: "$productDetails.product_type",
                        quantity:  {$literal : 1},
                        images: "$productDetails.images",
                    }
                },
                {
                    $sort: {
                        productType: 1,
                    }
                }
            ];
            if(searchCondition.length > 0){
                masterPipeLine.splice(4,0, {$match: { $and: searchCondition}});
            }

            const masterListItem = await MasterList.aggregate(masterPipeLine)
            console.log("############################################ here i am");
            return res.status(200).json(masterListItem);
        }catch(error){
            console.error("Error getting master list products:", error);
            return res.status(500).json({message: "Error getting master list products. Contact the customer service."});
        }
    }

    // Step 1: Match the gavorite list for the given customer and list name

    // Step 2: Flatten the document to get all the product list as single

    // Step 3: Get the products details from Product collection by lookup

    // Step 4: Filter the relevent product details, dont add other variants

    // Step 5: return the products details with necessary fields
    try {

        const pipeline = [
            {
                $match : {
                    customerId,
                    storeId,
                    listName
                }
            },
            {
                $unwind: '$products'
            },
            {
                $lookup: {
                    from : "products",
                    localField: "products.variantId",  // Match the variantId from favorite list with variantId in product collection
                    foreignField: "variants.id", // Match the variantId from products.varaints
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails" // unwind the product details not the variant details
            },
            {
                $addFields: {
                    "productDetails.variants": {
                        $filter: {
                            input: "$productDetails.variants",
                            as: "variant",
                            cond: { $eq: ["$$variant.id", "$products.variantId"]}
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: "$productDetails.id",
                    variantId: { $arrayElemAt: ["$productDetails.variants.id", 0]}, //Get the varint Id
                    title: "$productDetails.title",
                    variantTitle: { $arrayElemAt: ["$productDetails.variants.title", 0]}, // Get the specific title of the matched varaint
                    vendor: "$productDetails.vendor",
                    sku: { $arrayElemAt: ["$productDetails.variants.sku", 0] }, // Get the specific SKU of the matched variant // the value is still array with single object so that we have to extract the data as array
                    price: { $arrayElemAt: ["$productDetails.variants.price", 0] }, // Get the specific price of the matched variant
                    productType: "$productDetails.product_type",
                    quantity: "$products.quantity",
                    images: "$productDetails.images",
                }
            },
            {
                $sort: {
                    productType: 1,
                }
            }
        ];

        if(searchCondition.length > 0){
            pipeline.splice(4,0, {$match: { $and: searchCondition}}); 
        }

        const listProducts = await FavoriteList.aggregate(pipeline);

        console.log("##################### all product list send from favorite list: ", listProducts.length);
        //console.log(listProducts);
        return res.status(200).json(listProducts);
    }catch(error){
        console.error("Error getting favorite list products:", error);
        return res.status(500).json({message: "Error getting favorite list products. Contact the customer service."});
    }
};


export const getListNameFromQuickOrder = async(req, res) => {
    const {customerId} = req.params;
    const showMasterList = req.query.showMasterList === 'false' ? false : true;
    
    if(!req.query.shop){ 
        console.log("###: Missing required parameters: Shop while you want to get your list");
        res.status(400).json({message: "Missing required parameters: Shop"}); 
        return; 
    }
    const storeId = `offline_${req.query.shop}`;
    //const storeId = `offline_emertest2.myshopify.com`;
    console.log(`###: Get List for the customer:  ${customerId} & storeId: ${storeId}`);
    
    try { 
        const favoriteList = await FavoriteList.find({customerId, storeId});
        let customerDetails = await Customer.find({customerId});
        
        if(customerDetails.length === 0){
            customerDetails = new Customer({
                customerId,
                storeId,
                masterList: [],
            })
            await customerDetails.save();
        }
        
        if(favoriteList){
            console.log(`###: These are the customer Details: ${customerDetails}`);
            const favList = favoriteList.map(list => list.listName);
            
            if(customerDetails && showMasterList){
                customerDetails[0].masterList.map(list => { favList.unshift(list)});
            }
            console.log("###: All list send from favorite list: ", favList);
            return res.status(200).json(favList);
        } else{
            return res.status(200).json([]);
        }
    }catch(error){
        console.error("Error getting favorite list:", error);
        res.status(500).json({message: "Error getting favorite list"});
    }
};

export  const addProductToQuickList = async(req, res) => {
    const {customerId, variantId, quantity="1", selectedList="Default"} = req.body;

    if(!req.query.shop){ 
        console.log("###: Missing required parameters: Shop while you want to get your list");
        res.status(400).json({message: "Missing required parameters: Shop"}); 
        return; 
    }
    const storeId = `offline_${req.query.shop}`;

    //const storeId = `offline_emertest2.myshopify.com`;
    let message = {};

    try {
        let masterList = await MasterList.findOne({storeId, profession: selectedList});
        if(masterList){ return res.status(200).json({message: "List is not editable"}); }

        let favoriteList = await FavoriteList.findOne({customerId, storeId, listName: selectedList});
       // console.log(`################### Favorite List: ${favoriteList}`);
        if(favoriteList){
            const productIndex = favoriteList.products.findIndex(product => product.variantId === parseInt(variantId));   
            //console.log(`######## product Index`, productIndex);

            if(productIndex !== -1){
                // product exists in the list, update the quantity
                message = {message: "Product already exists. Quantity updated from " + favoriteList.products[productIndex].quantity + " to " + quantity};
                favoriteList.products[productIndex].quantity = parseInt(quantity);
            } else{
                // product does not exist in the list, add it 
                favoriteList.products.push({variantId: parseInt(variantId), quantity: parseInt(quantity)});
                message = { message : "Product added to the list, Quantity: " + quantity};
            }
        } else{
            //list does not exist, create it
            favoriteList = new FavoriteList({
                customerId,
                storeId,
                listName: selectedList,
                products: [{variantId: parseInt(variantId), quantity: parseInt(quantity)}]
            })
            message = { message : `New List Created ${selectedList} with product ${variantId}, Quantity: ` + quantity};
            //console.log(`############# New List Created`, favoriteList);
        }
        await favoriteList.save();
        return res.status(200).json(message);
    }catch(error){  
        console.error("Error adding quick list:", error);
        return res.status(500).json({message: "Error adding quick list"});
    }
  
};


export const deleteProductFromList = async(req, res) => {

    // [                                                                                           
    //    { variantId: '46405971968251', quantity: '3' },                                                                          
    //    { variantId: '46405972558075', quantity: '10' }
    // ]                                                                          
       
    console.log("############# reached here");
    const {customerId, listName} = req.params;
    //console.log("### Delete product from list: ", customerId, listName);
    const productList = req.body;
    //console.log("### Delete product from list: ", productList);
    const arrayVariantId = productList.map(product => product.variantId);
    //console.log("### Delete product from list: ", arrayVariantId);

    try {
        const favoriteList = await FavoriteList.findOne({customerId, listName});
        //res.status(500).json(favoriteList);
        console.log("Before deleting", favoriteList);
        
        if(favoriteList){
            favoriteList.products = favoriteList.products.filter(products => {
                const shouldRemove = arrayVariantId.includes(products.variantId.toString());
                return !shouldRemove;
            });
        } else{
            console.log("List is not Editable");
            return res.status(403).json({message: "List is not Editable"});
        }
        //console.log("After deleting", favoriteList.products.length);

        await favoriteList.save();
        res.status(200).json({message: `Product deleted from list ${listName}`});
    } catch(error){
       //console.error("Error deleting product from list:", error);
        res.status(500).json({message: "Error deleting product from list"});
    }

};


export const createfavoriteList = async(req, res) => {
    const {customerId, listName} = req.params;

    if(!req.query.shop){ 
        console.log("###: Missing required parameters: Shop while you want to get your list");
        res.status(400).json({message: "Missing required parameters: Shop"}); 
        return; 
    }
    const storeId = `offline_${req.query.shop}`;

    try {
        const favoriteList = new FavoriteList({
            customerId,
            storeId,
            listName,
            isPrimary: false,
            products:[]
        })
        await favoriteList.save();
        console.log(`Favorite List ${listName} created successfully`);
        res.status(200).json({message: `Favorite List ${listName} created successfully`});
    } catch(error){
        console.error("Error creating favorite list:", error);
        res.status(500).json({message: "Error creating favorite list"});
    }
};