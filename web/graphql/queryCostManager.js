// Centralized GraphQL client, rate-limit handling, cost tracking
// # Query cost caching, utility for rateLimit

/**
 * /src/graphql/costCatalog.js
 *
 * This module caches the actual query cost (actualQueryCost) of GraphQL calls.
 * In production, you might replace this with a Redis store or a proper database
 * so that the cache survives app restarts or scales across multiple instances.
 */

import crypto from "crypto";

// In-memory cache for query costs
// Key: query hash (string), value: cost (number)
// const costCache = {};

/**
 * Returns a simple MD5 hash for the given query string.
 * Useful for identifying repeated queries.
 *
 * @param {string} query - The raw GraphQL query
 * @returns {string} - The MD5 hash of the query
 */
// export function getQueryHash(query) {
//     return crypto.createHash("md5").update(query).digest("hex");
    
// }

/**
 * Stores the cost in our in-memory cache.
 *
 * @param {string} queryHash - The unique MD5 of the query
 * @param {number} cost - The actual cost (actualQueryCost) from Shopify
 */
// export function storeQueryCost(hash, cost){
//     costCache[hash] = cost;
// }

/**
 * Retrieves a stored cost from the cache.
 *
 * @param {string} queryHash - The unique MD5 of the query
 * @returns {number|null} - The previously stored cost, or null if not known
 */
// export function getStoreCost(hash){
//     return costCache.hasOwnProperty(hash) ? costCache[hash] : null;
// }



// QueryCostManager tracks available points and costs
// Updates points based on restore rate
// Handles throttling with exponential backoff
// Maintains historical query costs
// Prevents requests when insufficient points

export class QueryCostManager {
    constructor(){
        this.queryCosts = new Map();

        this.maximumAvailable = 2000;
        this.currentAvailable = 2000;
        this.restoreRate = 100;
        this.lastUpdateTime = Date.now();
        this.backoffMs = 1000;
    }

    // update points based on restore rate
    // we make a call there will be some time difference - we will restore points based on that
    updateAvailablePoints() {
        const now = Date.now();
        const timeDiff = now - this.lastUpdateTime;
        const restoredPoints = Math.floor((timeDiff)/1000 * this.restoreRate);
        this.currentAvailable = Math.min(this.maximumAvailable, this.currentAvailable + restoredPoints);
        this.lastUpdateTime = now;

    }

    // store the cost of the query
    storeQueryCost(queryHash, cost){
        this.queryCosts.set(queryHash, {
            cost,
            timestamp: Date.now(),
        });
    }

    // get the stored cost of the query
    getStoredCost(queryHash){
        return this.queryCosts.get(queryHash)?.cost || null;
    }

    // get the query hash
    getQueryHash(query){
        return crypto.createHash("md5").update(query).digest("hex");
    }

    // check if we have enough points to make the query
    canMakeQuery(queryHash){
        this.updateAvailablePoints();
        const estimatedCost = this.getStoredCost(queryHash) || 50;
        return this.currentAvailable >= estimatedCost;
    }

    // update the throttle status
    updateThrottleStatus(status){
        this.maximumAvailable = status.maximumAvailable;
        this.currentAvailable = status.available;
        this.restoreRate = status.restoreRate;
    }

    updateFromResponse(queryHash, cost){
        this.storeQueryCost(queryHash, cost.requestedQueryCost);
        //console.log("####################### cost ", cost);
        this.currentAvailable = cost.throttleStatus.currentlyAvailable;
        this.maximumAvailable = cost.throttleStatus.maximumAvailable;
        this.restoreRate = cost.throttleStatus.restoreRate;
    }

    async handleThrottling(){
        console.log(`GraphQL THROTTLED error encountered. Retrying in ${this.backoffMs}ms : ${this.backoffMs/1000}.`);
        await new Promise(resolve => setTimeout(resolve, this.backoffMs));
        this.backoffMs *= 2;
        this.updateAvailablePoints();
    }
}

// Export singleton instance
export const queryCostManager = new QueryCostManager();