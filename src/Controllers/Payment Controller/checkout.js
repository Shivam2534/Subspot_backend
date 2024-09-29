import { instance } from "../../index.js";
import crypto from "crypto";
import { User } from "../../Models/User Model/User.Model.js";
import { Payment } from "../../Models/Payment Model/Payment.Model.js";

const CreateAnOrderForPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(amount);
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

function getNextPaymentDate(currentPaymentDate) {
  const nextPaymentDate = new Date(currentPaymentDate);

  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

  return nextPaymentDate;
}

// const verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       userId,
//       subscribingEmail,
//       amount,
//     } = req.body;

//     // Input validation
//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       res.status(400).json({ message: "Missing required parameters" });
//       return;
//     }

//     const secret = process.env.RAZORPAY_API_SECRET;
//     if (!secret) {
//       console.error("RAZORPAY_API_SECRET is not set in environment variables");
//       res.status(500).json({ message: "Internal server error" });
//       return;
//     }

//     // Generate the signature
//     const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
//     const generated_signature = crypto
//       .createHmac("sha256", secret)
//       .update(payload)
//       .digest("hex");

//     // Verify the signature
//     if (
//       crypto.timingSafeEqual(
//         Buffer.from(generated_signature),
//         Buffer.from(razorpay_signature)
//       )
//     ) {
//       console.log("Payment is successful");
//       if (userId) {
//         const payment = await Payment.create({
//           userId: userId,
//           paymentId: razorpay_payment_id,
//           paymentOrder: razorpay_order_id,
//           paymentSignature: razorpay_signature,
//           amount: amount,
//         });

//         if (!payment) {
//           return res.status(500).json({
//             message:
//               "Payment status could not be saved. Please contact customer service immediately",
//           });
//         }

//         const currentDate = new Date();
//         const nextPaymentDate = getNextPaymentDate(currentDate);

//         const updatedUserInfo = await User.updateOne(
//           { _id: userId },
//           {
//             $set: {
//               subscribingEmail: subscribingEmail,
//               isVerified: true,
//               isSubscribed: true,
//               isPaymentCompleted: true,
//               currentStatus: "Under process",
//               lastPaymentDate: currentDate,
//               nextPaymentDate: nextPaymentDate,
//             },
//           }
//         );

//         if (!updatedUserInfo) {
//           return res.status(200).json({
//             success: false,
//             message:
//               "Payment status could not be saved. Please contact customer service immediately",
//           });
//         }

//         const updatedUserAfterPayment = await User.findOne({ _id: userId });

//         return res.status(200).json({
//           message: "Payment verified successfully",
//           data: updatedUserAfterPayment,
//           success: true,
//           redirectURL: `/paymentSuccess?referenceNo=${razorpay_payment_id}`,
//         });
//       } else {
//         return res.status(200).json({
//           success: false,
//           message: "Valid User Not Found",
//         });
//       }
//     } else {
//       console.log("Payment signature not matched");
//       res
//         .status(500)
//         .json({ message: "Internal server error", success: false });
//     }
//   } catch (error) {
//     console.error("Error in payment verification:", error);
//     res.status(500).json({ message: "Internal server error", success: false });
//   }
// };

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      subscribingEmail,
      amount,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !subscribingEmail ||
      !amount
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required parameters" });
    }

    const secret = process.env.RAZORPAY_API_SECRET;
    if (!secret) {
      console.error("RAZORPAY_API_SECRET is not set in environment variables");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(generated_signature),
        Buffer.from(razorpay_signature)
      )
    ) {
      console.log("Payment signature verification failed");
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    console.log("Payment signature verified successfully");

    const payment = await Payment.create({
      userId,
      paymentId: razorpay_payment_id,
      paymentOrder: razorpay_order_id,
      paymentSignature: razorpay_signature,
      amount,
    });

    if (!payment) {
      console.error("Failed to create payment record");
      return res.status(500).json({
        success: false,
        message: "Failed to record payment. Please contact customer support.",
      });
    }

    const currentDate = new Date();
    const nextPaymentDate = getNextPaymentDate(currentDate);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          subscribingEmail,
          isVerified: true,
          isSubscribed: true,
          isPaymentCompleted: true,
          currentStatus: "Under process",
          lastPaymentDate: currentDate,
          nextPaymentDate,
        },
        $push: {
          paymentHistory: {
            paymentId: payment._id,
            amount,
            date: currentDate,
            status: "success",
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.error(`Failed to update user information for userId: ${userId}`);
      return res.status(404).json({
        success: false,
        message:
          "User not found or update failed. Please contact customer support.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and user updated successfully",
      data: updatedUser,
      redirectURL: `/paymentSuccess?referenceNo=${razorpay_payment_id}`,
    });
  } catch (error) {
    console.error("Error in payment verification:", error);
    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred. Please try again or contact support.",
    });
  }
};

export { CreateAnOrderForPayment, verifyPayment };
