import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  
  // CRITICAL: Add this field - it's used everywhere in the backend
  transaction: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  mpesaReceipt: String,
  
  // Fixed: lowercase to match backend code, added 'cancelled'
  status: {
    type: String,
    enum: ["pending", "success", "failed", "cancelled"],
    default: "pending",
    required: true
  }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;