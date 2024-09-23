import express from "express";
import {
  CreateAnOrderForPayment,
  verifyPayment,
} from "../../Controllers/Payment Controller/checkout.js";

const router = express.Router();

router.route("/createorder").post(CreateAnOrderForPayment);
router.route("/verifyPayment").post(verifyPayment);

export default router;
