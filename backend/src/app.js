import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import ordersRouter from "./routes/orders.js";
import webhooksRouter from "./routes/webhooks.js";
import healthRouter from "./routes/health.js";
import paymentsRouter from "./routes/payments.js";
import downloadRoutes from "./routes/download.js";
import cartRoutes from "./routes/cart.js";

const app = express();

app.use(
  helmet({
    // API-only backend serving no HTML — CSP/COEP add no value here and
    // can interfere with the Razorpay checkout flow on the frontend origin.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.set("trust proxy", 1);

// Guest checkout has no auth, so order ids (though cryptographically random)
// are the only access control. Rate limit the endpoints where brute-forcing
// or replaying against them would matter most.
const paymentsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const ordersLookupLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

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
app.use("/api/cart", express.json());

app.use("/api/payments", paymentsLimiter, paymentsRouter);
app.use("/api/health", healthRouter);
app.use("/api/orders", ordersLookupLimiter, ordersRouter);
app.use("/api/webhooks/razorpay", webhookLimiter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/download", downloadRoutes);
app.use("/api/cart", cartRoutes);

export default app;