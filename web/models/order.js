
import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  id: {
    type: String,
    required: false, // Nullable if variantId is null in some cases
  },
  title: {
    type: String,
    required: true,
  },
  titleVariant: {
    type: String,
    required: false
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  currentQuantity: {
    type: Number,
  },
  originalUnitPrice: {
    type: Number,
    required: true,
  },
  discountedUnitPrice: {
    type: Number,
    required: true,
  },
  originalTotalPrice: {
    type: Number,
    required: true,
  },
  discountedTotalPrice: {
    type: Number,
    required: true,
  },
  requiresShipping: {
    type: Boolean,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      
    },
    customerDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: null },
    },
    lineItems: {
      type: [lineItemSchema],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    displayFulfillmentStatus: {
      type: String,
      enum: ["UNFULFILLED", "PARTIALLY_FULFILLED", "FULFILLED", "CANCELLED"],
      required: true,
    },
    displayFinancialStatus: {
      type: String,
      enum: ["PENDING", "PARTIALLY_PAID", "PAID", "PARTIALLY_REFUNDED", "REFUNDED"],
      required: true,
    },
    subtotalPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalTax: {
      type: Number,
      required: true,
    },
    totalDiscounts: {
      type: Number,
      required: true,
    },
    totalShipping: {
      type: Number,
      required: true,
    },
    orderName: {
      type: String,
      required: true,
    },
    shopifyOrderId: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    processedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
