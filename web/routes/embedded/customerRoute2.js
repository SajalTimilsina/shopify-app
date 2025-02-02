// {
//     "customerId": "customer123",
//     "storeId": "store123",
//     "profession": "esthetic"
//   }

import express from "express";
import MasterList from "../../models/masterlist.js";
import Customer from "../../models/customer.js";
import masterlist from "../../models/masterlist.js";


const router = express.Router();


// Update customer profile with masterlist based on profession
router.post("/profile", async(req, res) => {
    const {customerId, profession} = req.body;
    const storeId = `offline_${res.locals.shopify.session.shop}`;
    console.log(`### Link Customer to Master List: STORE ID: ${storeId}, profession: ${profession}`);
    try{

        // find the master list
        // const masterList = await MasterList.findOne({profession, storeId});

        // if(!masterList){
        //     return res.status(400).json({
        //         message: "Master list not found"
        //     });
        // }
        // udpate the customer profile with masterList products
        const customer = await Customer.findOneAndUpdate(
            {customerId, storeId},
            {$addToSet: {masterList: profession}},
            {new: true, upsert: true}
        ).catch(error => {console.log(error)});
        res.status(200).json({message: `Customer profile updated successfully ${customerId}  --> ${profession}`});
        console.log(`Customer profile updated successfully ${customerId}`);
    } catch(error){
        console.error("Error updating customer profile:", error);
        res.status(500).json({message: "Error updating customer profile"});
    }
})

// Retrieve customer profile and their profession-based master list for a specific store
router.get("/profile/:customerId/:storeId", async(req, res) => {
    const {customerId, storeId} = req.params;

    try{

        const customerProfile = await Customer.findOne({customerId, storeId});

        if(!customerProfile){
            return res.status(400).json({
                message: "Customer profile not found"
            });
        }
        res.status(200).json(customerProfile);
    } catch(error){
        console.error("Error fetching customer profile:", error);
        res.status(500).json({message: "Error fetching customer profile"});
    }
})

// search for the customer profile based on th storeId

router.get("/profile/:storeId", async(req, res) => {
    const {storeId} = req.params;
    const {search, page= 1, limit= 10} = req.query;
    const query = search ? {storeId, name: {$regex: search, $options: "i"}} : {storeId};

    try{
        // we will build the search functionality later
        const customerProfile = await Customer.find(query)
             .skip((page -1) * limit)
             .limit(parseInt(limit));
        
        if(!customerProfile){
            return res.status(400).json({
                message: "Customer profile not found"
            });
        }
        res.status(200).json({customerProfile, currentpage: page, limit, total: customerProfile.length})

    } catch (error) {
        console.error("Error fetching customer profile:", error);
        res.status(500).json({message: "Error fetching customer profile"});
    }
})


export default router;