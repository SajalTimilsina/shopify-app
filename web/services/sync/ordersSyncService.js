import shopify from "../../shopify.js";
import Product from "../../models/product.js";
import Order from "../../models/order.js";
import Customer from "../../models/customer.js";
import { executeShopifyQuery } from "../../graphql/graphqlClient.js";
import mongoose from "mongoose";


export const ordersSyncService = {
   /**
   * Bulk sync: fetch all orders (pages of size 10 in this example).
   * Use "fetchAllLineItems" if you need to get all line items for each order.
   */
    async syncAllOrders(session){
        let cursor = null;
        let hasNextPage = true;
        let allOrders = [];
            
        console.log("############################################## Syncing orders...");

        while(hasNextPage) {
            let tenOrders = [];
            const { edges, pageInfo } = await fetchOrders(session, cursor);
            hasNextPage = pageInfo.hasNextPage || false;
            //hasNextPage = false;
            cursor = edges[edges.length -1]?.cursor || null;
            console.log("### Last Node cursor:", JSON.stringify(cursor, null, 2));
            console.log("### Page Info:", JSON.stringify(pageInfo.hasNextPage, null, 2));
            //console.log("### ------------- Last Edges:--------", JSON.stringify(edges, null, 2));


            // itterating over the order edge to get the lineItems for each order based on lineItem Cursor
            for ( const edge of edges){
                const order = edge.node;
                //console.log("Order:", JSON.stringify(order, null, 2));
                const initialLineItems = order.lineItems.edges;
                const hasLineItems = order.lineItems.pageInfo.hasNextPage;
                //console.log(" Inline has the next items ----", hasLineItems);
                if(hasLineItems){
                    // will return all line items for the order
                    const fullLineItems = await fetchAllLineItems(session, order.id, initialLineItems);
                    order.lineItems = fullLineItems;
                    allOrders.push(order);
                
                    //console.log(`Synced order: ${order.name} with ${fullLineItems.length} line items`, JSON.stringify(order, null, 2));
                } else {
                    // flatten initial line items
                    order.lineItems = [...initialLineItems.map(e => e.node)];
                    allOrders.push(order);
                }
                tenOrders.push(order);
            }
            // Upsert in MongoDB
            await upsertOrder(session, tenOrders);     
        }
        console.log(`[syncAllOrders] Synced ${allOrders.length} orders.`);
    },


    async syncOrderById(session, shopifyOrderId) {
        console.log(`[syncOrderById] Syncing order by ID: ${shopifyOrderId}`);

        const singleOrder = await fetchSingleOrder(session, shopifyOrderId);
        if(!singleOrder){
            console.error(`[syncOrderById] Order not found: ${shopifyOrderId}`);
            return;
        }
        const initialLineItems = singleOrder.lineItems.edges;
        if(initialLineItems.pageInfo.hasNextPage){
            singleOrder.lineItems = await fetchAllLineItems(session, shopifyOrderId, initialLineItems);
            singleOrder.lineItems = initialLineItems;
        } else {
            // flatten initial line items
            singleOrder.lineItems = initialLineItems.map(edge => edge.node);
        }
            // 3) Upsert in Mongo
        await upsertOrder(singleOrder);

        return singleOrder;
    },

}


/* ------------------------------------------------------------------
   PRIVATE HELPER FUNCTIONS
   Keep these private to "ordersSyncService" unless you need to 
   share them with other modules.
------------------------------------------------------------------ */


const fetchOrders = async ( session, cursor = null) => {

    const query = `
        query($cursor: String) {
          orders(first: 2, after: $cursor) {
            edges {
              node {
                id
                name
                createdAt
                processedAt
                displayFulfillmentStatus
                displayFinancialStatus
                subtotalPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                totalPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                totalTaxSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                totalShippingPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalDiscountsSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                currentSubtotalPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                currentTotalDutiesSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
            
                customer {
                  id
                  legacyResourceId
                  firstName
                  lastName
                  email
                  phone
                  createdAt
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      title
                      sku
                      currentQuantity
                      quantity
                      variant {
                        id
                        legacyResourceId
                        title
                        price
                      }
                      originalUnitPriceSet {
                        presentmentMoney {
                          amount
                          currencyCode
                        }
                      }
                      discountedUnitPriceSet {
                        presentmentMoney {
                          amount
                          currencyCode
                        }
                      }
                      originalTotalSet {
                        presentmentMoney {
                          amount
                          currencyCode
                        }
                      }
                      discountedTotalSet {
                        presentmentMoney {
                          amount
                          currencyCode
                        }
                      }
                      
                      requiresShipping
                    }
                    cursor
                  }
                    pageInfo {
                      hasNextPage
                  }
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `;

    try {
        const data = await executeShopifyQuery(session, { query, variables: { cursor}});
        console.log("Data from fetchOrders:", data.orders);
        return data.orders;

    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
}

/**
 * If the order has more than 10 line items, we need to paginate to retrieve them all.
 */
const fetchAllLineItems = async (session, orderId, initialLineItems) => {
    console.log("[fetchAllLineItems] Gathering remaining line items for order:", orderId);

    let lineItems = [...initialLineItems.map(edge => edge.node)];
    let lineItemCursor = initialLineItems[initialLineItems.length -1]?.cursor;
    let hasNextPage = true;


  while(hasNextPage) {
    const query = `
      query ($orderId: ID!, $lineItemCursor: String) {
        order(id: $orderId) {
          lineItems(first: 10, after: $lineItemCursor) {
            edges {
              node {
              id
              title
              sku
              currentQuantity
              quantity
              product {
                id
                
              }
              variant {
                id
                legacyResourceId
                title
                price
              }
              originalUnitPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              discountedUnitPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              originalTotalSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              discountedTotalSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              
              requiresShipping
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }`;

      //console.log("Query:", { data: { query, variables: { orderId, lineItemCursor } } });

      try {
        //console.log(" ### Query with cursor ###", lineItemCursor);
        const data = await executeShopifyQuery(session, {
            query,
            variables: { orderId, lineItemCursor }
        });
        const newLineItems = data.order.lineItems.edges;
        lineItems = [...lineItems, ...newLineItems.map(edge => edge.node)];
        hasNextPage = data.order.lineItems.pageInfo.hasNextPage;
        lineItemCursor = newLineItems[newLineItems.length -1]?.cursor;
       // console.log("### Line Items:", data.order.lineItems.pageInfo.hasNextPage);
       
      } catch (error) {
        console.error("[fetchAllLineItems] Error:", error);
        throw error;
      }
  }
  console.log(`[fetchAllLineItems] Found total ${lineItems.length} line items.`);
  return lineItems;

}


/**
 * Fetch a single Order by ID (Shopify GID).
 */
async function fetchSingleOrder(session, shopifyOrderId) {
    const query = `
      query ($id: ID!) {
        order(id: $id) {
          id
          name
          createdAt
          customer {
            firstName
            lastName
            email
          }
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                sku
                quantity
                product {
                  id
                  leagcyResourceId
                }
                variant {
                  id
                  legacyResourceId
                  title
                  price
                }
                originalUnitPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                discountedUnitPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                originalTotalSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                discountedTotalSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
                
                requiresShipping
              }
              cursor
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `;
  
    try {
      const data = await executeShopifyQuery(session, {
        query,
        variables: { id: shopifyOrderId },
      });
      return data.order; // null if not found
    } catch (error) {
      console.error("[fetchSingleOrder] Error:", error);
      throw error;
    }
  }


  /**
 * Upsert (insert or update) the order in MongoDB.
 * You can customize fields as needed.
 */
async function upsertOrder(session, orders) {
    try {

     //console.log("Order to update", JSON.stringify(order, null, 2));
     //console.log("### Orders to update ###", orders);
     //console.log("### Orders length ###", orders.length);
      const operations = await Promise.all (
        orders.map( async order => {

        // check if the customer exists
        let customer = null;
        let storeId = `offline_${session.shop}`;
        if (order.customer) {
            customer = await Customer.findOne({ storeId, id: order.customer.legacyResourceId });
            if(!customer){
                customer = new Customer ({
                    email: order.customer.email,
                    firstName: order.customer.firstName,
                    lastName: order.customer.lastName
                })
                await customer.save();
            }
        }
        //check if the product exists and create them if they dont  - will return array of product

          const lineItems = await Promise.all(
              order.lineItems.map( async lineItem => {
                // find the product or create it if it doesn't exist
                let product = null;
                if(lineItem.variant){
                    product = await Product.findOne({ 
                        storeId,
                        "variants.id" : lineItem.variant.legacyResourceId
                      });
                      if(!product){
                        product = new Product({
                          storeId,
                          storeName: session.shop,
                          id: lineItem.variant.legacyResourceId,
                          title: lineItem.variant.title,
                          vendor: lineItem.variant.vendor || null,
                          product_type: lineItem.variant.productType || null,
                          handle: lineItem.variant.handle || null,
                          tags: lineItem.variant.tags  || [],
                          variants: lineItem.variant.map( v => {
                            return {
                              id: v.legacyResourceId,
                              product_id: lineItem.product.legacyResourceId,
                              price: v.price,
                              sku: v.sku,
                              title: v.title
                            }
                          }),
                          images: lineItem.variant.images || []
                        })
                        await product.save();
                      }
                      //console.log("### Product:", product);
                      
                    } else {
                      //console.error("### Product not found for line item:", lineItem);
                      //create a ideal product for deleted items
                      product = new mongoose.Types.ObjectId('67902d9bc91dee7e2cc765db');
                      lineItem.variant = {legacyResourceId: 111111111111111111111111n}
                    }
  
                    return {
                      product_id: product._id,
                      id: lineItem.variant.legacyResourceId,
                      title: lineItem.title || '',
                      titleVariant: lineItem.variant.title || '',
                      sku: lineItem.sku || '',
                      currentQuantity: lineItem.currentQuantity || 0,
                      quantity: lineItem.quantity || 0,
                      originalUnitPrice: lineItem.originalUnitPriceSet.presentmentMoney.amount || 0,
                      discountedUnitPrice: lineItem.discountedUnitPriceSet.presentmentMoney.amount || 0,
                      originalTotalPrice: lineItem.originalTotalSet.presentmentMoney.amount || 0,
                      discountedTotalPrice: lineItem.discountedTotalSet.presentmentMoney.amount || 0,
                      requiresShipping: lineItem.requiresShipping || false
                    }
                })
          )

        console.log("-------------------- ### Line Items ###", lineItems);

        return {
          updateOne: {
            filter: {
              storeId: storeId,
              shopifyOrderId: order.id.split("/").pop()
            },
            update: {
              $set: {
                storeId: storeId,
                customer: customer? customer._id : null,
                customerDetails: customer? {
                  firstName: customer.firstName || null,
                  lastName: customer.lastName || null,
                  email: customer.email || null,
                  phone: customer.phone || null
                } : null,
                lineItems: lineItems,
                status: order.displayFinancialStatus || null,
                displayFullfillmentStatus: order.displayFulfillmentStatus || null,
                displayFinancialStatus: order.displayFinancialStatus || null,
                subtotalPrice: order.subtotalPriceSet.presentmentMoney.amount || 0,
                totalPrice: order.totalPriceSet.presentmentMoney.amount || 0,
                totalTax: order.totalTaxSet.presentmentMoney.amount || 0,
                totalDiscounts: order.totalDiscountsSet.presentmentMoney.amount || 0,
                totalShipping: order.totalShippingPriceSet.shopMoney.amount || 0,
                orderName: order.name || null,
                shopifyOrderId: order.id.split("/").pop() || null,
                createdAt: order.createdAt || null,
                processedAt: order.processedAt || null,
              }
            },
            upsert: true
          }
        }
      })
      
    )
 

        // Bulk write the operations
        const result = await Order.bulkWrite(operations);
        console.log(`[upsertOrder] Upserted ${result.modifiedCount} orders.`);
        return result;

      } catch (error) {
        console.error("[upsertOrder] Mongo upsert error:", error);
        throw error; // Optionally re-throw or handle differently
      }
}