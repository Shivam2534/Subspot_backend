import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

dotenv.config({
  path: "./.env",
});

app.use(
  cors({
    origin: ["http://localhost:5173", "https://subsspot.vercel.app/"], // Allow frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // If you're using cookies or authentication
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("Public")); // when we need to store files/imgs/pdfs in locall machine we can put them inside public folder

app.use(cookieParser()); // so that we can do CRUD operations over cookies

app.get("/", (req, res) => {
  res.send("Good to go with the youtube premium");
});

import paymentRoute from "./Routes/Paymet Routes/PaymentRoute.js";
app.use("/api/v1/pay", paymentRoute);

import ApiKeyRouter from "./Routes/Paymet Routes/GetapiKeyRoute.js";
app.use("/api/v1/key", ApiKeyRouter);

import userRouter from "./Routes/User Routes/user.Route.js";
app.use("/api/v1/user", userRouter);

export { app };
