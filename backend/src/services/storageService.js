import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// create supabase client (server-side)
const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey // IMPORTANT: service role key, not anon
);

const BUCKET = "paid-products";

export async function getDownloadUrl(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60, {
      download: true,
    });

  if (error) {
    throw new Error("Failed to create download URL");
  }

  return data.signedUrl;
}