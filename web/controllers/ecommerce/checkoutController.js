import shopify from "./../../shopify.js";
import _ from "lodash";

export const createCheckout = async(req, res) => {
    const customerId = req.params.customerId;
    const reqData = req.body;
    const shop = reqData.shop;
    const cartItems = reqData.cart.items;

    // create line items

    const lineItems = cartItems.map(item => {
        return {
            title: item.title,
            variantId:`gid://shopify/ProductVaraint/${item.variant_id}`,
            quantity: item.quantity,
            originalUnitPrice: item.original_price,
            customAttributes: [
                {
                    key: "vendor", value: item.vendor,
                    key:"product_type", value: item.product_type
                }
            ]
        }
    });
// send request to server

let session = await shopify.config.sessionStorage.findSessionsByShop(shop);
console.log("Store Name from the shopify", session[0]);
console.log(typeof session[0]);

const storeSession = {                                                                                                                                            
   "id": "offline_emertest.myshopify.com",                                                                                                                        
    "shop": "emertest.myshopify.com",                                                                                                                              
    "state": "081202951797651",                                                                                                                                    
    "isOnline": false,                                                                                                                                             
    "scope": "read_orders,write_products,write_script_tags",                                                                                                       
    "accessToken": "shpua_287fbd426d3bedef7df17e38ff083c44"                                                                                                        
     };
     


     const countData = await shopify.api.rest.Product.count({
        session: session[0],
      });

    //res.status(200).send(countData);

    //  console.log(JSON.stringify(storeSession) === JSON.stringify(session[0]));
    //  console.log(_.isEqual(storeSession, session[0]));

    const client = new shopify.api.clients.Graphql({
        session: session[0]
    });

    const countData1 = await client.query({
        data: `query {
        products(first: 5) {
            edges {
            cursor
                node {
                    id
                    title
                }
            }
        }
    }`
});

    res.status(200).send(JSON.stringify(countData1.body.data.products));


    // const data = await client.query({
    //     data: {
    //         query: `
    //         mutation draftOrderCreate($input : DraftOrderInput!) {
    //             draftOrderCreate(input: $input) {
    //                 draftOrder{
    //                     id}
    //                 userErrors{
    //                     field
    //                     message
    //                     }
    //                 }
    //             }`,
    //             variables: {
    //                 input: {
    //                     customerId: customerId,
    //                     lineItems: lineItems,
    //                 }
    //             }

    //     }
    // })

    // const data = await client.query({
    //     data: {
    //         query: `
    //             {
    //                 productsCount {
    //                     count
    //                 }
    //             }
    //         `
    //     }
    // })

   // res.status(200).json({message: "Checkout created successfully"});
}