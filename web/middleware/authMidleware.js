// @def   role = ["Admin", "manager", "User"]
// @def  req.user.roles = ["Admin"]

  const authenticateUser = async (req, res, next) => {
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

const authorize = (role) => (req, res, next) =>  {
   //const userRole = req.user.roles;
  
//    return ( res, req, next) => {
//         const hasPermission = role.includes(req.user.roles);
//         if(!hasPermission){
//             return res.status(403).json({success: false, message: 'User not authorized to access this route'});
//         }
//         next();
//    }
 next();
}

export { authenticateUser, authorize };