// models/PriceList.js
import mongoose from "mongoose";
const PriceListSchema = new mongoose.Schema({
  name: String,
  storeId: String,
  customerId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  customerEmail: String,
  products: [
    {
      productId: String,
      originalPrice: Number,
      applyPrice: Number,
      discountPriceByPercentage: Number
    }
  ]
  // any other fields you need
}, { timestamps: true });

export default mongoose.models.PriceList || mongoose.model("PriceList", PriceListSchema);