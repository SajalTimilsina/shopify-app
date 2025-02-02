// get the details for dashboards


import express from 'express';
import shopify from "../../shopify.js";
const router = express.Router();

//read shop information

router.get("/store/info", async(_req, res) =>{
  let storeInfo = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(storeInfo);
})

router.get("/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

//read Collection data

router.get("/collections/count", async(_req, res)=>{
  const countData = await shopify.api.rest.CustomCollection.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
})

//read orders data
router.get("/orders/all", async(_req,res) => {
  const countOrder = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: "any"
  });
  console.log(`Count Order ${countOrder}`);
  res.status(200).send(countOrder);
})

router.post("/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

export default router;