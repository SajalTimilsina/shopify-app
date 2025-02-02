import express from "express";
import MasterList from "../../models/masterlist.js";
import FavoriteList from "../../models/favoriteList.js";

const router = express.Router();

router.get("/flist", async(req, res) => {
    try {
        const favoriteList = await FavoriteList.find();
        if(!favoriteList){
            return res.status(404).json({message: "No List available. Create a list first"});
        }
        const updateFavoriteList = favoriteList.map(f =>({customerName: "CName",listName: f.listName, status: "enable", isPrimary: f.isPrimary, cDate: "Oct 03, 2024", uDate: "Oct 03, 2024"}));
        console.log(" #### Favorite List: ", updateFavoriteList);
        res.status(200).json(updateFavoriteList);
    }catch(error){
        console.error("Error fetching favorite list:", error);
        res.status(500).json({message: "Internal server error"});
    }
})


router.get("/list", async(req, res) => {
    try {
        const masterList = await MasterList.find();
        if(!masterList){
            return res.status(404).json({message: "No List available. Create a list first"});
        }
        const professionList = masterList.map(masterList => masterList.profession);
        res.status(200).json(professionList);
    }catch(error){
        console.error("Error fetching master list:", error);
        res.status(500).json({message: "Internal server error"});
    }
})

router.post("/create", async(req, res) => {

    const {profession} = req.body;
    const storeId = `offline_${res.locals.shopify.session.shop}`;
    try{
        const masterList = await MasterList.findOne({profession, storeId});
        if(masterList){
            return res.status(400).json({message: "Profession already exists"});
        }

        const newMasterList = new MasterList({
            storeId,
            profession,
            products:[]
        });
        await newMasterList.save();
        res.status(201).json({message: `Profession created successfully for ${profession}`});
    } catch(error){
        console.error("Error creating profession:", error);
        res.status(500).json({message: "Internal server error"});
    }
})

router.post("/masterlisttofav", async(req, res) => {
    console.log("################ Master List to favourite: ##########");
    const  {customerId, profession, isChecked, isPrimary= false} = req.body;
    const storeId = `offline_${res.locals.shopify.session.shop}`;

    console.log(`Profession: ${profession}, isChecked: ${isChecked}, isPrimary: ${isPrimary}, storeId: ${storeId}`);

    try{
        const masterList = await MasterList.findOne({profession, storeId});
        if(!masterList){
            return res.status(404).json({message: "Profession not found"});
        }
        console.log("MasterList: ", masterList);
        const products = masterList.products;
        if(masterList.products.length === 0){
            return res.status(404).json({message: "No products available for this profession"});
        }
        const productSchema = masterList.products.map(product => {
            return {
                variantId: product
                }
            });
        
            const favoriteList = new FavoriteList({
                customerId,
                storeId,
                listName: profession,
                isPrimary,
                products: productSchema,
            });

            await favoriteList.save();

            if(isChecked){
                await MasterList.findOneAndDelete({profession, storeId});
            }
            res.status(201).json({message: "MasterList moved to FavoriteList successfully"});

    } catch (error){
        console.error("Error updating master list:", error);
        res.status(500).json({message: "Internal server error"});
    }
})

export default router;