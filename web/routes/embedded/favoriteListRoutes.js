//  masterlist the list -- will be deleted after 

import express from "express";
import mongoose from "mongoose";
import MasterList from "../../models/masterlist.js";
import FavoriteList from "../../models/favoriteList.js";
import Product from "../../models/product.js";

import favoriteListController from "../../controllers/embedded/favoriteListController.js";



const router = express.Router();

router.post("/:selectedList", async(req, res) => {
    console.log("I have reached");

    try {
        const {selectedList} = req.params;

        const {products, isPrimary = false, isMasterList = false, customerId = "999999999"} = req.body;

        const storeId = `offline_${res.locals.shopify.session.shop}`;
        console.log(`SelectedList: ${products} StoreIds: ${storeId} Products:  ${products}`);   

        const productDetails = products.map(product => ({
            variantId: product.variantId,
            quantity: product.quantity ||  1
        }));

        // check if list is there
        let favoriteList = await FavoriteList.findOne({listName: selectedList, storeId, customerId});
        if(favoriteList){
        // Total Task: get check if the variantId is present then update the quantity not
        // if not present then add the product to the list

        // get productIds from existing list
        const productIds = favoriteList.products.map(product => product.variantId);
        // get varaintId from api
        const newProductIds = productDetails.map(product => product.variantId);
        // create set for each list                                                                                                                                                                                                                                                                                                                                                                                    

        const uniqueProductIds = new Set(productIds);
        const uniqueNewProductIds = new Set(newProductIds);
    
        const newProductDetails = productDetails.filter(product => !uniqueProductIds.has(product.variantId));
        //console.log("Unique productIds:", [...uniqueProductIds]);
        //console.log("Unique new products Ids:", [...uniqueNewProductIds]);
        //console.log("New Product Details:", newProductDetails);


        // step 4: update the current products
        const updatedProductDetails = productDetails.map(product => {
            if(uniqueProductIds.has(product.variantId)){
                const existingProduct = favoriteList.products.find(p => p.variantId === product.variantId);
                existingProduct.quantity = product.quantity;
                return existingProduct;
            }
            return product;

        })
        // Step 5: Add new products to the list
        favoriteList.products = [...updatedProductDetails, ...newProductDetails];
        //console.log(`ProductIds: ${productIds} NewProductIds: ${newProductIds} UniqueProductIds: ${uniqueProductIds} UniqueNewProductIds: ${uniqueNewProductIds} NewProductDetails: ${newProductDetails}`);

        // create newProductdetails by filtering the productDetails which are not in the set of productIds

        // map the productDetails and check if it is inside set of productIds and then update the quantity

            // const productIds = favoriteList.products.map(product => product.variantId);
            // const newProductIds = productDetails.map(product => product.variantId);
            // const uniqueProductIds = new Set(productIds);
            // const uniqueNewProductIds = new Set(newProductIds);
            // const newProductDetails = productDetails.filter(product => !uniqueProductIds.has(product.variantId));
            // const updatedProductDetails = productDetails.map(product => {
            //     if(uniqueProductIds.has(product.variantId)){
            //         const existingProduct = favoriteList.products.find(p => p.variantId === product.variantId);
            //         existingProduct.quantity += product.quantity;
            //         return existingProduct;
            //     }
            //     return product;
            // });

            // favoriteList.products = [...updatedProductDetails, ...newProductDetails];
            // await favoriteList.save();
        

        // add new product to the list
            

        } else {
            favoriteList = new FavoriteList({
                listName: selectedList,
                storeId, 
                customerId,
                isPrimary,
                products: productDetails,
                isMasterList
            })
        }
        await favoriteList.save();

        res.status(200).json(favoriteList);

    }catch(error){
       console.error("Error updating master list:", error);
        res.status(500).json({message: "Error updating master list"});
    }
})



router.get("/:profession", async(req, res) => {
    const {profession} = req. params;
    const storeName = res.locals.shopify.session.shop;
    console.log(`Profession: ${profession}`);
    try{
        const favoriteList = await FavoriteList.findOne({profession, storeId: `offline_${storeName}`});
        //console.log(`MasterList: ${masterList}`);
        if(!favoriteList){
            return res.status(404).json({message: "Master list not found"});
        }
        res.status(200).json(favoriteList);
    }catch(error){
       // console.error("Error fetching master list:", error);
        return res.status(500).json({message: "Error fetching master list"});
    }
    // try{
    //     const masterList = await MasterList.findOne({profession, storeId: `offline_${storeName}`});
    //     //console.log(`MasterList: ${masterList}`);
    //     if(!masterList){
    //         return res.status(404).json({message: "Master list not found"});
    //     }
    //     res.status(200).json(masterList);
    // }catch(error){
    //    // console.error("Error fetching master list:", error);
    //     return res.status(500).json({message: "Error fetching master list"});
    // }
    res.status(200);
})


// GET all favorite list for a customer
router.get("/", favoriteListController.getFavoriteLists);

// GET a specific favorite list for a customer
router.get("/:id", favoriteListController.getFavoriteListById);

// POST create a new favorite list for a customer
router.post("/", favoriteListController.createFavoriteList);

// PUT update a favorite list for a customer
router.put("/:id", favoriteListController.updateFavoriteList);

// DELETE a favorite list
router.delete("/:id", favoriteListController.deleteFavoriteList);



export default router;