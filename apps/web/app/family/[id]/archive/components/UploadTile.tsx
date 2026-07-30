"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

type UploadTileProps = {
  familyId: string;
  albumId: string;
  onUploaded: () => void;
};

export function UploadTile({ familyId, albumId, onUploaded }: UploadTileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const uploadUrlRes = await fetch(`/api/family/${familyId}/media/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, albumId }),
      });
      if (!uploadUrlRes.ok) throw new Error("Failed upload");
      const { uploadUrl, storageKey } = await uploadUrlRes.json();

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Failed to upload file");

      const confirmRes = await fetch(`/api/family/${familyId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          albumId,
        }),
      });
      if (!confirmRes.ok) throw new Error("Failed to save file");
      return confirmRes.json();
    },
    onSuccess: () => {
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG and PNG is allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large max 8MB");
      return;
    }

    setError(null);
    upload.mutate(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        className="text-sm"
      />
      {upload.isPending && <p className="text-xs">Uploading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
