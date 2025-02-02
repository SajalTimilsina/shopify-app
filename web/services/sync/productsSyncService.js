import shopify from "../../shopify.js";
import Product from "../../models/product.js";
import Order from "../../models/order.js";
import Customer from "../../models/customer.js";
import { executeShopifyQuery } from "../../graphql/graphqlClient.js";
import product from "../../models/product.js";

export const productsSyncService = {

    async syncAllproducts(session) {
        let cursor = null;
        let hasNextpage = true;
        let allProducts = [];

        console.log("############################################## Syncing products...");
        let count = 0;
        while (hasNextpage) { 
            const { edges, pageInfo } = await fetchAllProducts(session, cursor);
            hasNextpage = pageInfo.hasNextPage;
            // process the current batch of products
            const currentProductsBatch = [...edges.map(e => e.node)];
            upsertProduct(session, currentProductsBatch);
            
            allProducts = [...allProducts, ...currentProductsBatch];
            cursor = edges[edges.length -1]?.cursor || null;

            //console.log("getNode", edges);
            console.log("Edges Length: ", edges.length);
            console.log(`cursor: ${cursor}. Edges Length: ${edges.length}. hashNextPage: ${hasNextpage}`);
            
            //hasNextpage = false;
        }
        
    },
    async syncProductById(session, productId){

    }

}

async function fetchAllProducts(session, cursor = null) {
    const query = `query($cursor: String){
        products(first: 50, after: $cursor){
            edges{
            node{
                id
                legacyResourceId
                title
                vendor
                productType
                handle
                tags
                status
                variantsCount{
                count
                }
                variants(first: 10){
                edges{
                    node{
                    id
                    legacyResourceId
                    sku
                    price
                    title
                    
                    }
                }
                }
                
                media(first: 5){
                edges {
                    node{
                    mediaContentType
                    alt
                    ...on MediaImage {
                    image {
                        url
                        altText
                    }
                    }
                    
                    }
                }
                }
            }
            cursor
            }
            pageInfo{
            hasNextPage
            }
        }
    }`;

    const data = await executeShopifyQuery(session, { query, variables: { cursor } });
    //console.log("data", JSON.stringify(data, null, 2));
    return data.products;
}


async function upsertProduct(session, productData) {
    const storeId = `offline_${session.shop}`;
    //console.log("### productData ### ", JSON.stringify(productData, null , 2));
    const operations = productData.map( p => {
        const id = p.id.split('/').pop();

        return{
            updateOne: {
                filter: {
                    storeId,
                    id
                },
                update: {
                    $set: {
                        storeId,
                        storeName: session.shop,
                        id,
                        title: p.title,
                        vendor: p.vendor,
                        product_type: p.productType,
                        handle: p.handle,
                        tags: p.tags,
                        variants: p.variants.edges.map(e => {
                            const v = e.node;
                            return {
                                id: v.id.split('/').pop(),
                                product_id: id,
                                price: v.price,
                                sku: v.sku,
                                title: v.title
                            }
                        }),
                        images: p.media.edges.map(e => {
                            const m = e.node;
                            return m?.image?.url
                        })
                    }
                },
                upsert: true
            }
        }
    });

    const result = await Product.bulkWrite(operations);
    console.log("Upserted products: ", result.modifiedCount);
    return result;
}