import shopify from "../shopify.js";
import Product from "../models/product.js";
import { executeShopifyQuery } from "../graphql/graphqlClient.js";


const ordersController = {
    async fetchAndStoreOrders(session) {
        //console.log(session.scope);
        await syncOrders(session);
        //await testFunction(session);
        
    },
};

const fetchOrders = async ( session, cursor = null) => {
  const client = new shopify.api.clients.Graphql({session});
  try {

    console.log("Fetching orders with cursor:", cursor);
    const response = await client.query({
      data : {
        query: `query ($cursor: String) {
              orders(first: 10, after: $cursor) {
                edges {
                  node {
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
                          name
                          quantity
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
            }`,
            variables: { cursor }
          }
        });
    //console.log(JSON.stringify(response.body.data.orders));

    return response.body.data.orders;

    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
}

const fetchAllLineItems = async (session, orderId, initialLineItems) => {
  // will return all line items for the order
  // { edges: [ { "node" : {}}, {"node" : {}}] }

  console.log(" *** fetchAllLineItems ***");
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
                name
                quantity
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
        const client = new shopify.api.clients.Graphql({session});
        const response = await client.query({
          data: {
            query,
            variables: { orderId, lineItemCursor }
          }
        });
        const newLineItems = response.body.data.order.lineItems.edges;
        lineItems = [...lineItems, ...newLineItems.map(edge => edge.node)];
        hasNextPage = response.body.data.order.lineItems.pageInfo.hasNextPage;
       
      } catch (error) {
        console.error("Error fetching line items:", error);
        throw error;
      }
  }
  console.log(`Sync at Line Item: ${lineItems.length} with ${lineItems} line items`);
  return lineItems;

}

// Step 1: fetch the first 50 orders
const syncOrders = async (session) => {
  let cursor = null;
  let hasNextPage = true;
  let allOrders = [];
  console.log("############################################## Syncing orders...");

  while(hasNextPage) {
    const { edges, pageInfo } = await fetchOrders(session, cursor);
   // console.log("### Total orders Edges:", JSON.stringify(edges.length, null, 2));
    //console.log("### Page Info:", JSON.stringify(pageInfo.hasNextPage, null, 2));

    // itterating over the order edge to get the lineItems for each order based on lineItem Cursor
    for ( const edge of edges){
      const order = edge.node;
      console.log("Order:", order.name);
      const initialLineItems = order.lineItems.edges;
      const hasLineItems = order.lineItems.pageInfo.hasNextPage;
      //console.log(" Inline has the next items", hasLineItems);
      if(hasLineItems){
        // will return all line items for the order
        const fullLineItems = await fetchAllLineItems(session, order.id, initialLineItems);
        order.lineItems = fullLineItems;
        allOrders.push(order);
        if(order.name === "#1005"){
          console.log(`Synced order: ${order.name} with ${fullLineItems.length} line items`, JSON.stringify(order, null, 2));

          }
      }
    }
    // checking if we have more orders to fetch at order edges
  hasNextPage = pageInfo.hasNextPage;

 }
}

export async function fetchOrders1(session, first = 5){
  console.log("##### Fetching orders...   ####");
    const query = `
      query FetchProducts($first: Int!)
      {
        products(first: $first)
        {
          edges  
          {
            node 
            {
              id
              title 
            }
          }
        }
      }
    `;
  const data = await executeShopifyQuery(session, { query, variables: { first}});
  console.log(data);

};


export default ordersController;
