// Client-side Supabase client for direct uploads
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * Upload a file directly to Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path in the bucket
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Erreur d'upload: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(path);

  if (onProgress) {
    onProgress(100);
  }

  return urlData.publicUrl;
}
