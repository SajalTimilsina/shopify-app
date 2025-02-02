import express from 'express';
// import userModel from "../../models/userModel.js";
import CustomerProduct from "../../models/customerProductModel.js";
import { getAllProducts } from '../../controllers/customerProductController.js';

const router = express.Router();

// PRODUCTS PAGE APIS

// need to delete
// router.get("/getusers", async(req, res) => {
//     try{
//       let users = await userModel.find({});
//       res.status(200).send(users);
//     }catch(error){
//       console.log(error);
//     }
//   });
  
  
  router.get("/getcustomer", async(req, res) => {
    try{
      let users = await CustomerProduct.find({});
      const customerIdOnly = users.map(user => user.customerId);
      const session = res.locals.shopify.session;
      res.status(200).send(customerIdOnly);
    }catch(error){
      console.log(error);
    }
  });
  
  
  // Get customer details
  router.get("/customers/:customerID/products", async (req, res) => {
  
    try{
      const {customerID} = req.params;
      //console.log(`Request the List: Customer ID: ${customerID}`);
      const customerProduct = await CustomerProduct.findOne({customerId: customerID});
      //console.log(`customerProduct: ${customerProduct}`);
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
  
  });
  


  // MASTER LIST GET ALL PRODUCTS BELONGS TO THE STORE

  router.get("/products", getAllProducts);


  export default router;