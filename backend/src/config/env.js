import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",

  databaseUrl: process.env.DATABASE_URL || "",
  // Only disable certificate validation when explicitly opted into (e.g. a
  // local Postgres with a self-signed cert). Defaults to secure.
  dbSslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",

  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

if (!env.razorpayKeyId || !env.razorpayKeySecret) {
  console.warn("Missing Razorpay API keys in backend/.env");
}

if (!env.databaseUrl) {
  console.warn("Missing DATABASE_URL in backend/.env");
}

if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
  console.warn("Missing Supabase storage credentials in backend/.env");
}