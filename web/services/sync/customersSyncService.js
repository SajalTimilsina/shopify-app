import { executeShopifyQuery } from "../../graphql/graphqlClient.js";
import Customer from "../../models/customer.js";

export const customersSyncService = {

    async syncAllcustomers(session) {
        let cursor = null;
        let hasNextpage = true;
        let allCustomers = [];
        let processedCount = 0;

        console.log("############################################## Syncing customer...");

        while(hasNextpage){
            const {edges, pageInfo} = await fetchAllCustomer(session, cursor);
            const currentCustomer = [...edges.map( n => n.node)];
            allCustomers = [...allCustomers, ...edges.map( n => n.node)];

            // Process current batch of customers
            await upsertCustomer(session, currentCustomer);
            
            processedCount += currentCustomer.length;

            //update cursor and hasNextpage
            cursor = edges[edges.length -1]?.cursor;
            hasNextpage = pageInfo.hasNextPage;
            //hasNextpage = false;
            
        }
        console.log("allCustomers", allCustomers);
       
    },

    async syncCustomerById(session, customerId){


    }
};


async function fetchAllCustomer(session, cursor = null) {
    const query = `query($cursor: String) {
        customers(first: 2, after: $cursor){
                edges{
                        node{
                            id
                            legacyResourceId
                            lastName
                            firstName
                            email
                            numberOfOrders
                            lifetimeDuration
                            createdAt
                            statistics{
                                predictedSpendTier
                            }
                        }
                    cursor
                    }
            pageInfo {
                hasNextPage
            }
        }
    }`;

    try {
        const data = await executeShopifyQuery(session, { query, variables: { cursor } });
        //console.log(" #####  data ### ", data);
        //console.log("### the data : ## ", data.pageInfo);
        return data.customers;

    } catch (error){
        console.log("error", error);
    }

    
}

async function fetchSingleCustomer(session, shopifyCustomerId){

}

async function fetchAllLineItems(params) {
    
}

async function upsertCustomer(session, customerData) {
    const storeId = `offline_${session.shop}`;
    console.log("### customerData ### ", JSON.stringify(customerData, null , 2));

    const operations = customerData.map( customer => {
        return {
            updateOne: {
                filter: {
                    id: customer.legacyResourceId,
                    storeId
                }, 
                update: {
                    $set: {
                        id: customer.legacyResourceId,
                        gid: customer.id,
                        name: customer.firstName + " " + customer.lastName,
                        email: customer.email || null,
                        predictedSpendTier: customer.statistics.predictedSpendTier || null,
                        tags: customer.tags || [],
                        createdAtShopify: customer.createdAt || null,
                        status: 'Active',
                    }
                },
                upsert: true
            }
        }
    });
    return await Customer.bulkWrite(operations);
}