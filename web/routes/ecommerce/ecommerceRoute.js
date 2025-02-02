import express from "express";
//import { getCustomerProducts, addCustomerProduct, deleteCustomerProduct } from '../../controllers/customerProductController.js';
//import authenticateUser from '../middleware/authenticateUser';
// import userModel from "../../models/userModel.js";  // need to delete
import customerProductModel from "../../models/customerProductModel.js";
import {
  getListProducts,
  createfavoriteList,
  deleteProductFromList,
  getListNameFromQuickOrder,
  addProductToQuickList,
} from "../../controllers/ecommerce/favoriteListController.js";
import { createCheckout } from "../../controllers/ecommerce/checkoutController.js";
import { searchProducts } from "../../controllers/ecommerce/searchProductsController.js";

import SaveCart from "./../../models/savecart.js";

const router = express.Router();
//app.use(authenticateUser);

// router.post("/", async (req, res) => {
//   let userdata = req.body;
//   console.log(`Userdata ${userdata}`); // Log the entire object

//   try {
//     let createUser = await userModel.create({
//       username: userdata[0],
//       useremail: userdata[1],
//     });
//     return res.status(200).send(userdata);
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(200).json("-----User already exist---");
//     } else {
//       console.log(error.message);
//       return res.json(error.message);
//     }
//   }
// });

router.get("/getcustomer", async (req, res) => {
  try {
    let users = await customerProductModel.find({});
    const customerIdOnly = users.map((user) => user.customerId);
    res.status(200).send(customerIdOnly);
  } catch (error) {
    console.log(error);
  }
});

router.get("/", async (req, res) => {
  console.log("I am called ");
  res.status(200).json("thanks");
});

// router.get("/:customerID/products", getCustomerProducts);
// router.post("/:customerID/products", addCustomerProduct);
// router.delete("/:customerID/products/:productID", deleteCustomerProduct);

//Customer get all products in the favorite List
router.get("/quickorderlist/:customerId/:listName", getListProducts);
router.delete("/quickorderlist/:customerId/:listName", deleteProductFromList); // delete product from favorite list
router.post("/quickorderlist/:customerId/:listName", createfavoriteList);
// Customer QuickOrder
router.get("/quickorderlist/:customerId", getListNameFromQuickOrder); // get list of favorite lits
router.post("/quickorderlist/:customerId", addProductToQuickList);

//checkout
router.post("/checkout/:customerId", createCheckout);

//search
router.get("/search", searchProducts);

router.post("/savecart/:customerId", async (req, res) => {
  const data = req.body;
  const customerId = req.params.customerId;
  const storeId = `offline_${req.query.shop}`;

  console.log(data.products);

  const productSchema = data.products.map((product) => {
    return {
      variantId : product.id,
      quantity : product.quantity
    }
  });
  const saveCart = new SaveCart({
    customerId,
    storeId,
    products: productSchema
  });

  console.log(productSchema);

  await saveCart.save();

  //console.log(data);
  res.status(200).json("thanks from backend");
})

export default router;
