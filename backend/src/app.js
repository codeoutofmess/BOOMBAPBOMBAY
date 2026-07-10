import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import ordersRouter from "./routes/orders.js";
import webhooksRouter from "./routes/webhooks.js";
import healthRouter from "./routes/health.js";
import paymentsRouter from "./routes/payments.js";
import downloadRoutes from "./routes/download.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://boombapbombay.onrender.com",
  "https://boombapbombay.com",
  "https://www.boombapbombay.com",
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

app.use("/api/webhooks/razorpay", express.raw({ type: "application/json" }));
app.use("/api/orders", express.json());
app.use("/api/payments", express.json());

app.use("/api/payments", paymentsRouter);
app.use("/api/health", healthRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/download", downloadRoutes);

export default app;