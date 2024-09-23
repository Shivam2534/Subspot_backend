import { instance } from "../../index.js";
import crypto from "crypto";

const CreateAnOrderForPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (its 500 rs)
      currency: "INR",
      // receipt: "order_rcptid_11",
    };
    const order = await instance.orders.create(options);

    return res.status(200).json({
      order: order,
    });
  } catch (error) {
    return res.status(400).json({
      error,
      message: "order not created",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Input validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ message: "Missing required parameters" });
      return;
    }

    const secret = process.env.RAZORPAY_API_SECRET;
    if (!secret) {
      console.error("RAZORPAY_API_SECRET is not set in environment variables");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Generate the signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Verify the signature
    if (
      crypto.timingSafeEqual(
        Buffer.from(generated_signature),
        Buffer.from(razorpay_signature)
      )
    ) {
      console.log("Payment is successful");
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        redirectURL: `/paymentSuccess?referenceNo=${razorpay_payment_id}`,
      });
    } else {
      console.log("Payment signature not matched");
      res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Error in payment verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { CreateAnOrderForPayment, verifyPayment };
