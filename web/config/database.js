import mongoose from "mongoose";

const connectDB = async() => {
    // Production URL
    //const url = "mongodb+srv://itemerdepot:ynrzCQF0SzAAkGxD@cluster0.yghxy.mongodb.net/QuickOrder?retryWrites=true&w=majority&appName=Cluster0";

    // Development URL
    const url = `mongodb+srv://emerdepot:BcRDArvVz27a1i64@quickorderappdev.3dkxm.mongodb.net/?retryWrites=true&w=majority&appName=QuickOrderAppDev`;

    try{
        await mongoose.connect(url);
        console.log("############ DB Connected ###############");
    } catch(err){
        console.log(" ############### Connection Error: ", err);
    }
}

export default connectDB;