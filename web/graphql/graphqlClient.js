// # Centralized GraphQL client, rate-limit handling, cost tracking
// `executeShopifyQuery` + backoff/retry logic

import shopify from "../shopify.js";
import { queryCostManager } from "./queryCostManager.js";

// Configuration for retry logic

const MAX_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 1000;


export async function executeShopifyQuery(session, {query, variables = {}}){
    
    // Step: 1 get query hash
    const queryHash = queryCostManager.getQueryHash(query);

    // create a new GraphQl client for this session
    const client = new shopify.api.clients.Graphql({session});
    
    let attemps = 0;

    while ( attemps < MAX_ATTEMPTS){
        //console.log(`Executing query ${queryHash}, cost ${queryCostManager.getStoredCost(queryHash)}, attempt ${attemps + 1}`);

        //console.log(" ##### Can Make Query: ", queryCostManager.canMakeQuery(queryHash));
        if(!queryCostManager.canMakeQuery(queryHash)){
            console.log(" ######## calling from 1 ##########");
            //console.log(`Query ${queryHash} is too expensive to execute. waiting...`);
            await queryCostManager.handleThrottling();
            continue;
        }
        try{
            const response = await client.query({
                data: {
                    query,
                    variables
                }
            });
            //console.log("############################# printing ###############", response.body.data);

            if(response?.body?.errors){
                const errors = response.body.errors;
                const throttleError = errors.find(err => err.extensions?.code === "THROTTLED");

                if(throttleError){
                    console.log(" ######## calling from 2 ##########");
                    await queryCostManager.handleThrottling();
                    /////console.log("############## increasing the attempt ##############", errors);
                    attemps++;
                    continue;
                }

                //otherwise, throw all graphql errors
                throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
            }

            // Success response
            // Step 2: get the data
            const data = response?.body?.data;

            // Step 3: Check if the response includes rateLimits info
            if(response?.body?.extensions?.cost){
                console.log(" ------------------------ Updating the query cost and remaining points ------------------------");
                queryCostManager.updateFromResponse(queryHash, response.body.extensions.cost);
            }

            return data;
        } catch(error){
            
            // If we hit an HTTP 429 (too many requests) from Shopify
            const status = error?.response?.status;
            const errorCode = error?.response?.errors?.[0]?.extensions?.code;
            if(status === 429 || errorCode === "THROTTLED"){
                if(error?.response?.extensions?.cost){
                    queryCostManager.updateFromResponse(queryHash, error.response.extensions.cost);
                }
                console.log(" ######## calling from 3 ##########");
                await queryCostManager.handleThrottling();
                attemps++;
                continue;
            } else {
                // No rate limit error, so throw the error
                console.log(" ############## Not 429 or throttled error ##############", error?.response?.errors);
                throw error;
            }
        }
    }

    // reset backoff for next query
    queryCostManager.backoffMs = INITIAL_BACKOFF_MS;
    // If we reach this point, we exhaust our attemps, fail gracefully
    throw new Error(`Failed to execute query after ${MAX_ATTEMPTS} attempts`);
}