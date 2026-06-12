import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type UploadResult = { path: string; url: string };

/** Upload a file to the `media` bucket and return a long-lived signed URL. */
export async function uploadToMedia(file: File, folder = "uploads"): Promise<UploadResult> {
  const ext = file.name.split(".").pop() || "bin";
  const safe = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 60);
  const path = `${folder}/${Date.now()}-${safe}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (signErr || !data) throw signErr || new Error("Failed to sign URL");
  return { path, url: data.signedUrl };
}
