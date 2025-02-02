import { DeliveryMethod } from '@shopify/shopify-api';
import Products from '../models/product.js';

const productWebhooks = {
    PRODUCTS_UPDATE: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async (topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            console.log(`###: Received ${topic} webhook:`);
            //console.log(`Received ${topic} webhook:`, payload);
            createUpdate(payload, shop, topic);
        }
    },
    PRODUCTS_CREATE:{
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: '/api/webhooks',
        callback: async (topic, shop, body, webhookId) => {
            const payload = JSON.parse(body);
            console.log(`###: Received ${topic} webhook:`);
            //console.log(`Received ${topic} webhook:`, payload);
            createUpdate(payload, shop, topic);
        },
    },
}


async function createUpdate(payload, shop, topic){

    try {
     //console.log(`Received ${topic} webhook:`, payload);
     const {id, title, vendor, product_type, handle, tags, variants, images} = payload;
     console.log(` ${title}, ${vendor}, ${product_type}, ${handle}, ${tags}, ${variants}, ${images}`);
     const productData = {
         id,
         storeId: `offline_${shop}`,
         storeName: shop,
         title,
         vendor,
         product_type,
         tags: tags? tags.split(',').map(tag => tag.trim()) : [],
         variants: variants.map((variant) => ({
             id: variant.id,
             product_id: variant.product_id,
             price: variant.price,
             sku: variant.sku,
             tile: variant.title,
         })),
         images: images.map((image) =>image.src),
     };
     //console.log(productData);

         await Products.updateOne(
             {storeName: shop, id},
             {$set: productData},
             {upsert: true}
         );
         console.log(`### Webhooks ${topic}: Product ${productData.id} updated for shop ${shop}`);
     } catch(error) {
         console.error(`### Webhooks ${topic}: Failed to update product ${productData.id} for shop ${shop}`, error);
     }
}

export default productWebhooks;