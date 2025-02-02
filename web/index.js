// @ts-nocheck
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import path from "path";
import { fileURLToPath } from "url";

// Custom imports
import connectDB from "./config/database.js";
import CustomerProduct from "./models/customerProductModel.js";
// import userModel from "./models/userModel.js";
import { Schema } from "@mui/icons-material";
import embeddedShopifyRoutes from "./routes/embedded/embeddedShopifyRoutes.js";
import ecommerceRoute from "./routes/ecommerce/ecommerceRoute.js";
import embeddedAppRoutes from "./routes/embedded/embeddedAppRoutes.js";
import embeddedRoutes from "./routes/embedded/embeddedRoutes.js";
import productController from "./controllers/productController.js";
import ordersController from "./controllers/ordersController.js";
import  {syncServices} from "./services/sync/syncServices.js"; 

import webhookHandlers from './webhooks/index.js';
import favoriteList from "./routes/embedded/favoriteListRoutes.js";
import customerRoutes2 from "./routes/embedded/customerRoute2.js";
import profession from "./routes/embedded/profession.js";

import addScriptTags from "./utils/scriptTags.js";

// import { registerWebhooks } from "./utils/webhookRegistrar.js";
// import webhookRoutes from "./routes/embedded/webhookRoutes.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
// Connect to MongoDB
connectDB(); 

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());

// app.post(shopify.config.webhooks.path, (req, res, next) => {
//   //console.log("###: Webhook received!", req.topic);
//   //console.log("############################## ##########"+shopify.config.webhooks.path);
//   next();
// })

// app.use( async (req, res, next) => {
//   try{
//     await ordersController.fetchAndStoreOrders(session);
//   }catch(error){
//     console.error(`Failed to fetch and store orders for shop: ${session.shop}`, error);
//   }
//   next();
// })

app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  async(req,res) => {
    const session = res.locals.shopify.session;

    //before initiating the background tasks. This way, the user is redirected right away.

    // Run background tasks separately


      try {
        //await productController.fetchAndStoreProducts(session);
        //await ordersController.fetchAndStoreOrders(session);
        //console.log(session);

        console.log(`Products successfully fetched and stored for shop: ${session.shop}`);
      } catch (error) {
        console.error(`Failed to fetch and store products for shop: ${session.shop}`, error);
      }

      try{
        //await addScriptTags(session);
      }catch(error){
        console.error(`Failed to add script tags for shop: ${session.shop}`, error);
      }
      shopify.redirectToShopifyOrAppRoot();
  }
);

// app.get(
//   shopify.config.auth.callbackPath,
//   shopify.auth.callback(),
//   async(req, res) => {
//     const session = res.locals.shopify.session;

//     // Redirect the user immediately
//     //shopify.redirectToShopifyOrAppRoot(res);

//     //Run background tasks separately
    
//     //(async () => {
//       try {
//         await productController.fetchAndStoreProducts(session);
//         console.log(`Products successfully fetched and stored for shop: ${session.shop}`);
//       } catch (error) {
//         console.error(`Failed to fetch and store products for shop: ${session.shop}`, error);
//       }

//       try {
//         await addScriptTags(session);
//         console.log(`Script tags added for shop: ${session.shop}`);
//       } catch (error) {
//         console.error(`Failed to add script tags for shop: ${session.shop}`, error);
//       }
//     //})();

//     shopify.redirectToShopifyOrAppRoot(res);
//   }
// );



app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers }), (req, res,next ) => {
  console.log("###: Webhook received!", req.topic);
  next();
});

app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers }));

app.use(express.json());

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// Route for Shopify Embedded App
app.use("/api/*", shopify.validateAuthenticatedSession());


app.use("/api",async (req, res, next) => {

  console.log("###: Session from print: ", res.locals.shopify.session);
  //await syncServices.fullSync(res.locals.shopify.session);
  //await fetchOrders1(res.locals.shopify.session);
  //await ordersController.fetchAndStoreOrders( res.locals.shopify.session);
  //console.log(`Session from print: ${JSON.stringify(res.locals.shopify.session, null, 2)}  type: ${typeof res.locals.shopify.session}`);
  next();
});
// NATIVE APP REQUESTS
app.use('/api', embeddedShopifyRoutes);

// QUICK ORDER APP REQUESTS
app.use("/api", embeddedAppRoutes);   // something with CUSTOMER
app.use("/api", embeddedRoutes);      // Organization routes
app.use("/api/masterlist", favoriteList);  // favorite list routes
app.use("/api/customer", customerRoutes2);  // customer profile with master list
app.use("/api/profession", profession);  // master list to favorite list convertor


app.use("/userdata/page", async(req, res)=> {

  const htmlContent = `<h1> This is the page content </h1>`;
  res.status(200).send(htmlContent);
})

// Route for Shopify E-commerce App
// app.use("/userdata/*", authenticateUser);
app.use("/userdata/", express.static(path.join(__dirname, 'assets')));

app.use("/userdata", ecommerceRoute);

// Issue : when the app is not open or session is not active, the frontend is not able to get the data as the session is not active
// async function authenticateUser(req, res, next) {
//   try {
//     let shop = req.query.shop;
//     console.log("#### Shop: from the query: ", shop);
//     let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
//     console.log("Store Name from the shopify", storeName);

//     //if (storeName && shop === storeName[0]?.shop) {
//       next();
//     //} else {
//       //console.log("Authorization failed for shop:", shop);
//       //res.status(403).send("User not Authorized");
//     //}
//   } catch (error) {
//     console.error("Authentication Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// }


app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, ()=>{
  console.log(`Server is running on port ${PORT}`);
});

