import { ordersSyncService } from './ordersSyncService.js';
import  { customersSyncService } from './customersSyncService.js';
import { productsSyncService } from './productsSyncService.js';  

let running = false;

export const syncServices = {


    async fullSync(session){
        if(running){
            console.log("Sync already in progress for shop:", session.shop);
            return;
        }
        running = true;

        // console.log("Starting full sync for products:", session.shop);
        // await productsSyncService.syncAllproducts(session);
        // console.log("Full sync completed for products:", session.shop);

        // console.log("Starting full sync for customer:", session.shop);
        // await customersSyncService.syncAllcustomers(session);
        // console.log("Full sync completed for Customer:", session.shop);

        
        // console.log("Starting full sync for shop:", session.shop);
        // await ordersSyncService.syncAllOrders(session);
        // console.log("Full sync completed for shop:", session.shop);

        running = false;

    },
    async syncOrderById(session, shopifyOrderId){
        console.log(`Starting sync for order ID: ${shopifyOrderId}`);
        await ordersSyncService.syncOrderById(session, shopifyOrderId);
        console.log(`Sync completed for order ID: ${shopifyOrderId}`);
    }
}