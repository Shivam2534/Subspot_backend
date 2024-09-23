import { Mongoose } from "mongoose";

const FamilySchema = new Mongoose.Schema(
  {
    // familyId: { type: String, required: true, unique: true },
    memberCount: { type: Number, default: 0, max: 6 },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isCompleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["forming", "active", "inactive"],
      default: "forming",
    },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    subscriptionDetails: {
      startDate: Date,
      endDate: Date,
      planType: String,
      isAutoRenew: { type: Boolean, default: true },
    },
    paymentHistory: [
      {
        paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
        amount: Number,
        date: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to update memberCount before saving
FamilySchema.pre("save", function (next) {
  if (this.members) {
    this.memberCount = this.members.length;
  }
  next();
});

// export default models.Family || model < IFamily > ("Family", FamilySchema);
export const Family = new Mongoose.model("Family", FamilySchema);
