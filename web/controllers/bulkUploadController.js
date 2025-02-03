
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import customerProductModel from "../models/customerProductModel.js";

mongoose.connect("mongodb+srv://itemerdepot:ynrzCQF0SzAAkGxD@cluster0.yghxy.mongodb.net/QuickOrder?retryWrites=true&w=majority&appName=Cluster0")
.then((()=> {
    console.log("############ DB Connected ###############");
}))
.catch(err => console.log(" ############### Connection Error: ", err));


//read the path
const filepath = path.join(process.cwd(),"list.json");

// function to read the JSON file and update the database
const bulkUplaodProductsFromFile = async() =>{
    try{ 
        const data = fs.readFileSync(filepath, "utf8");
        const {customerId, productList} = JSON.parse(data);

        //find customer's product list

        let customerProductList = await customerProductModel.findOne({customerId});

        if(!customerProductList){
            customerProductList = new customerProductModel({
                customerId,
                productList: [],
            });
        }
         // Clear the existing product list before adding new products

            customerProductList.productList = [];
        

        productList.forEach(product => {
            
            if(!product.id || !product.title || !product.vendor || !product.handle){
                console.error("Invalid product data");
            }else{
                console.log(`Product validated: ${product.title}`);
                customerProductList.productList.push(product);
            }
        });

        await customerProductList.save();
        console.log("Products uploaded successfully.");

    } catch(error){
        console.error("Error reading file", error);
    } finally{
        mongoose.connection.close();
    }
};

bulkUplaodProductsFromFile();
