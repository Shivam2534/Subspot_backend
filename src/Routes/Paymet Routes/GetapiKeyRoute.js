import { Router } from "express";
import getApiKey from "../../Controllers/Payment Controller/GetApiKey.js";

const ApiKeyRouter = Router();

ApiKeyRouter.get("/apikey", getApiKey);
// we are doing well

export default ApiKeyRouter;
