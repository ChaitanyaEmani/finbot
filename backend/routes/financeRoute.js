import express from "express";
import { addOrUpdateFinance, getFinanceData } from "../controllers/financeController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const financeRouter = express.Router();

financeRouter.post("/finance", authMiddleware, addOrUpdateFinance);
financeRouter.get("/finance", authMiddleware, getFinanceData);

export default financeRouter;
