import { logger } from "../utils/logger.js";
import { DeliveryMethod } from '@shopify/shopify-api';
import Customer from '../models/customer.js';
import defaultData from "../assets/defaultData.js";


const customerWebhooks = {
    "customers/create": {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async ( Topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            upsertCustomer(payload, shop, Topic);
        }
    },
    "customers/update": {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async (Topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            upsertCustomer(payload, shop, Topic);
        }
    },
}

async function upsertCustomer(payload, shop, Topic){

    const storeId = `offline_${shop}`;
    const { id, admin_graphql_api_id, email, first_name, last_name, phone, predictedSpendTier, tags, created_at } = payload;
    logger.info(`Webhooks: ${Topic}: Processing customer ${id} for shop ${shop} payload: ${JSON.stringify(payload, null, 2)}`);

    let customer;
    try {
        const existingCustomer = await Customer.findOne({ storeId, id });

        const updatedFields = {
            id,
            storeId,
            gid: admin_graphql_api_id || '',
            email: email || '',
            name: `${first_name} ${last_name}`,
            tags: tags || [],
            phone: phone || '',
            createdAtShopify: created_at,   
        };

        if(existingCustomer){
            updatedFields.predictedSpendTier = existingCustomer.predictedSpendTier;                           
        }
        customer = await Customer.findOneAndUpdate(
            { storeId, id },
            {
                $set: updatedFields,
            },
            { upsert: true, new: true }
            
        )
    } catch (error) {
        logger.error(`Webhooks: ${Topic}: Error upserting customer ${id} for shop ${shop}`, error);
    }

}

export default customerWebhooks;