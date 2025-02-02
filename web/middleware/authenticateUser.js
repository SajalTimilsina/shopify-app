// export default async function authenticateUser(req, res, next) {
//     let shop = req.query.shop;
//     let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
  
//     if(shop === storeName[0].shop){
//       next();
//       }else{
//         res.send("User not Authorized");
//       }

// }


export default async function authenticateUser(req, res, next) {
  try {
    let shop = req.query.shop;
    console.log("Shop:", shop);

    let storeName = await shopify.config.sessionStorage.findSessionsByShop(shop);
    console.log("Store Name:", storeName);

    if (storeName && shop === storeName[0]?.shop) {
      next();
    } else {
      console.log("Authorization failed for shop:", shop);
      res.status(403).send("User not Authorized");
    }
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(500).send("Internal Server Error");
  }
}
