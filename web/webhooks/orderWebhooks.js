import { DeliveryMethod } from '@shopify/shopify-api';
import Order from '../models/order.js';
import { logger } from '../utils/logger.js';
import Customer from '../models/customer.js';
import Product from '../models/product.js';
import defaultData from '../assets/defaultData.js';

const orderWebhooks = {
    "orders/create": {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async (topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            // console.log(`###: Received ${topic} webhook:`);
            //createUpdate(payload, shop, topic);
           // logger.info(`Received ${topic} webhook: ${JSON.stringify(payload, null, 2)}`);
            upsertOrder(payload, shop, topic);

        }
    },
    "orders/updated":{
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async (topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            //console.log(`###: Received ${topic} webhook:`);
            //logger.info(`Received ${topic} webhook: ${JSON.stringify(payload, null, 2)}`);

            //console.log(`Received ${topic} webhook:`, payload);
           // createUpdate(payload, shop, topic);
           const orders = Array.isArray(payload) ? payload : [payload];
           upsertOrder(payload, shop, topic);
        },
    },
}


async function upsertOrder(payload, shop, topic){
    try{
        logger.info(`Webhooks: ${topic}: Processing order ${payload.id} for shop ${shop}`);
        const { customer, line_items, fulfillment_status, financial_status, subtotal_price, total_price, total_tax= 0, total_discount, total_shipping_price_set, order_number, id, created_at, processed_at } = payload;
        const storeId = `offline_${shop}`;
        let customerDetails = [];

        if(customer){
            customerDetails = await Customer.findOneAndUpdate(
                { storeId, id: customer.id },
                {
                    $set: {
                        id: customer.id,
                        storeId: storeId,
                        email: customer.email,
                        firstName: customer.first_name,
                        lastName: customer.last_name,
                        phone: customer.phone,
                        createdAt: customer.created_at,
                    }
                },
                { upsert: true, new: true}
            );
        } else {
            customerDetails = defaultData.customer;
            logger.info(`Default customer assigned:  Customer not found in the payload`);

        }


        const lineItems = await Promise.all(
            line_items.map(async (lineItem) =>  {
                let product =[];
                product = await Product.findOne({ storeId: storeId, "variants.id": lineItem.variant_id });

                if(!product) {
                    logger.info(`lineItem ${lineItem.variant_id} for product ${lineItem.product_id} - ${lineItem.name} not found in the database`);
                    product = defaultData.product;
                }

                return {
                    product_id: product._id,
                    id: lineItem.variant_id,
                    title: lineItem.name,
                    titleVariant: lineItem.title ?? "Default Title",
                    sku: lineItem.sku ?? null,
                    currentQuantity: lineItem.current_quantity ?? 0,  // have to check in the schema
                    quantity: lineItem.quantity ?? 0,
                    originalUnitPrice: lineItem?.price_set?.shop_money?.amount ?? 0,
                    discountedUnitPrice: lineItem?.total_discount_set?.shop_money?.amount ?? 0,
                    originalTotalPrice: lineItem?.total_discount_set?.shop_money?.amount ?? 0,
                    discountedTotalPrice: lineItem?.total_discount_set?.shop_money?.amount ?? 0,
                    requiresShipping: lineItem.requires_shipping ?? true,
                };
        
            })
        );

        const finalData = {
            storeId: storeId,
            customerDetails: customerDetails,
            lineItems: lineItems,
            status: fulfillment_status,
            displayFulfillmentStatus: "FULFILLED",
            displayFinancialStatus: "PAID",
            subtotalPrice: payload.current_subtotal_price ?? 0,
            totalPrice: payload?.current_total_price ?? 0,
            totalTax: total_tax ?? 0,
            totalDiscounts: payload.current_total_discounts ?? 0, 
            totalShipping: total_shipping_price_set?.shop_money?.amount ?? 0,
            orderName: order_number,
            shopifyOrderId: id,
            createdAt: created_at,
            processedAt: processed_at,
        };

        //logger.info(`FinalData: ${JSON.stringify(finalData, null, 2)}`);

        const order = await Order.findOneAndUpdate(
            {storeId: storeId, shopifyOrderId: finalData.shopifyOrderId},
            {
                $set: finalData,
            },
            { upsert: true, new: true }
        )
        await order.save();
        logger.info(`Total Value: ${JSON.stringify(finalData, null, 2)}`);
        logger.info(`Webhooks: ${topic}: Order ${order.shopifyOrderId} for shop ${shop} updated successfully`);

    } catch(error){
        logger.error(`### Webhooks ${topic}: Failed to update order ${payload} for shop ${shop}`, error);
    }

}

export default orderWebhooks;