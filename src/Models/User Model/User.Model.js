import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
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
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      default: null,
    },
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//this code is for deencription
// using this "METHODS" basically we are adding methods in our userschema
UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // firstone is clear text password and second one is encripted password from data base we can access it by this also it returns true and false
};

// now we are genrating access tokens
UserSchema.methods.generateAccessToken = function () {
  // Jwt.sign({payload},accesstoken,{expiryaccesstoken}) // this is a syntex for generating tokens
  return Jwt.sign(
    {
      _id: this._id, // here id(everything) is coming from database,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// now we are genrating refresh token
UserSchema.methods.generateRefreshToken = function () {
  // Jwt.sign({payload},refreshtoken,{expiryrefreshtoken}) // this is a syntex for generating tokens
  return Jwt.sign(
    {
      _id: this._id, // here payload has less information
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = new mongoose.model("User", UserSchema);
