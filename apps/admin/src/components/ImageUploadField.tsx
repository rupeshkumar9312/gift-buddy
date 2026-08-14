"use client";

import { useId, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadImage } from "@/lib/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function ImageUploadField({
  accessToken,
  onUploaded,
}: {
  accessToken: string;
  onUploaded: (url: string) => void;
}) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Unsupported file type — use JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large — max 5MB.");
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadImage(accessToken, file);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex shrink-0 flex-col gap-1">
      <label
        htmlFor={inputId}
        className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium text-ink transition hover:border-primary hover:text-primary"
      >
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {uploading ? "Uploading…" : "Upload"}
      </label>
      <input
        id={inputId}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        disabled={uploading}
        className="hidden"
      />
      {error && <p className="max-w-[160px] text-xs text-primary">{error}</p>}
    </div>
  );
}
