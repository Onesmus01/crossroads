import mongoose from "mongoose";

const mpesaLogSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["success", "failed", "cancelled", "pending"],
      required: true
    },

    resultCode: {
      type: Number
    },

    resultDesc: {
      type: String
    },

    payload: {
      type: Object,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("MpesaLog", mpesaLogSchema);
