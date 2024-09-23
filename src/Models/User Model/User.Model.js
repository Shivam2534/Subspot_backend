import { Mongoose } from "mongoose";

const UserSchema = new Mongoose.Schema(
  {
    fullName: { type: String, required: true },
    loginEmail: { type: String, required: true, unique: true },
    subscribingEmail: { type: String },
    password: { type: String, required: true },
    avatar: { type: String },
    mobileNumber: { type: String },
    isVerified: { type: Boolean, default: false },
    isSubscribed: { type: Boolean, default: false },
    noOfTimesFamilyChanged: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["user", "admin", "familyAdmin"],
      default: "user",
    },

    isPaymentCompleted: { type: Boolean, default: false },
    isAPartOfFamily: { type: Boolean, default: false },
    currentStatus: {
      type: String,
      enum: ["Inactive", "Under process", "Active"],
      default: "Inactive",
    },

    lastPaymentDate: { type: Date },
    nextPaymentDate: { type: Date },
    wantToContinueForTheNextMonth: { type: Boolean, default: true },
    familyId: { type: Mongoose.Schema.Types.ObjectId, ref: "Family" },
    paymentHistory: [
      {
        amount: Number,
        date: Date,
        status: { type: String, enum: ["success", "failed", "pending"] },
      },
    ],
  },
  { timestamps: true }
);

export const User = new Mongoose.model("User", UserSchema);
