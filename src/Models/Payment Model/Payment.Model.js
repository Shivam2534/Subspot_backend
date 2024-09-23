import { Mongoose } from "mongoose";

const PaymentSchema = new Mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    familyId: { type: Schema.Types.ObjectId, ref: "Family" },
    // we will take from Razorpay
    paymentId: { type: String, required: true, unique: true },
    paymentOrder: { type: String, required: true },
    paymentSignature: { type: String, required: true },

    amount: { type: Number, required: true },
    paymentMode: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    appliedForRefund: { type: Boolean, default: false },
    refundDetails: {
      refundId: String,
      refundAmount: Number,
      refundDate: Date,
      refundStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
      },
    },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

// export default models.Payment || model < IPayment > ("Payment", PaymentSchema);

export const Payment = new Mongoose.model("Payment", PaymentSchema);
