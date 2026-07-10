import express from "express";
import { createCartOrder } from "../services/cartController.js";

const router = express.Router();

router.post("/checkout", createCartOrder);

export default router;