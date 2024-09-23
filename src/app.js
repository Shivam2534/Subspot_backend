import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
const app = express();

dotenv.config({
  // we are doing this so that on loading of our aplication as soon as possible hmare env varriable har kisi ko available ho jaye
  path: "./env",
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Good to go");
});

import paymentRoute from "./Routes/Paymet Routes/PaymentRoute.js";
app.use("/api/v1", paymentRoute);

import ApiKeyRouter from "./Routes/Paymet Routes/GetapiKeyRoute.js";
app.use("/api/v1/key", ApiKeyRouter);

export { app };
