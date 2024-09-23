import { app } from "./app.js";
import connectDB from "./Database/index.js";
import Razorpay from "razorpay";

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});


connectDB().then(() => {
  try {
    app.listen(`${process.env.PORT}` || 4000, () => {
      console.log("Server is Up and Running...");
    });
  } catch (error) {
    console.log("Server Down");
  }
});
