import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import ordersRouter from "./routes/orders.js";
import webhooksRouter from "./routes/webhooks.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use(cors({
  origin: env.frontendUrl,
}));

app.use("/api/webhooks/razorpay", express.raw({ type: "application/json" }));
app.use("/api/orders", express.json());

app.use("/api/health", healthRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/webhooks", webhooksRouter);

export default app;