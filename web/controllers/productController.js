import shopify from "../shopify.js"; // Import the Shopify instance
import Product from "../models/product.js";
import { resolve } from "path";

const productController = {
  async fetchAndStoreProducts(session) {
    try {
      let pageInfo = null;
      let allProducts = [];
      let count =0;

      //console.log(session);

      do {
        // Fetch products with pagination
        const response = await shopify.api.rest.Product.all({
          ...pageInfo?.nextPage?.query, // Use the nextPage query parameters if available
          session,
          limit: 50, // Number of products to fetch per request
        });

        //console.log(...pageInfo?.nextPage?.query);
        const products = response.data;
        // Process and store the products in the database (example, uncomment to use)
        
        const upsertProducts = products.map(async (product) => {

          const formattedProducts = {
          storeId: session.id,
          storeName: session.shop,
          id: product.id,
          title: product.title,
          vendor: product.vendor,
          product_type: product.product_type,
          handle: product.handle,
          tags: product.tags,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            product_id: variant.product_id,
            price: variant.price,
            sku: variant.sku ? variant.sku : " ",
            title: variant.title,
          })),
          images: product.images.map((image) => image.src),
         
        };
          //upsert product to prevent duplication
          count++;
          return Product.updateOne(
            {storeId: session.id, id: product.id}, // filter the product by storeID and id
            {$set: formattedProducts }, // update the product with the formatted product
            {upsert: true}); // Insert the product if it doesn't exist

        });

        // await all the upserts promises
        await Promise.all(upsertProducts);
        
        // Add a delay to avoid hitting rate limits
        console.log("#####: Syncing products for store:" + session.shop + ": Count: " + count);
        await delay(700);

        //allProducts = [...allProducts, ...formattedProducts];

        // Update pageInfo for the next iteration
        pageInfo = response.pageInfo;

      } while (pageInfo?.nextPage); // Continue fetching if there is a next page


    try{
        //await Product.insertMany(allProducts);
       // await Product.collection.createIndex({storeId: 1});
        //console.log(`${products.length} products stored in MongoDB.`);
        validateProductSync(session);
    }catch(error){
        console.error("Error storing products in MongoDB:", error);
        throw error;
    }

      console.log("All products successfully stored in MongoDB.");
    } catch (error) {
      console.error("Error fetching and storing products:", error);
      throw error;
    }
  },
};


async function validateProductSync(session){
    
    try {
        const shopifyResponse = await shopify.api.rest.Product.count({session});
        //const shopifyProductCount = shopifyResponse.data.count;
        //count the total data in mongoose
        const mongoProductCount = await Product.find({storeName: session.shop});
        console.log(`MongoDB product count: ${mongoProductCount.length}`);
        console.log("Shopify product count:", JSON.stringify(shopifyResponse, null,2));


        if (shopifyResponse.count !== mongoProductCount.length) {
            console.error("### Product count mismatch between Shopify and MongoDB.");
        } else {
            console.log("### Product count is in sync between Shopify and MongoDB.");
        }   
    } catch(error){
        console.error("Error validating product sync:", error);
        throw error;
    }

}

function delay(ms){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  })
}

export default productController;


