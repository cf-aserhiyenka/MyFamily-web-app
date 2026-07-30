"use client";

import { useMutation } from "@tanstack/react-query";

export type MediaFileRow = {
  id: string;
  albumId: string;
  originalName: string;
  url: string;
  canDelete: boolean;
};

type MediaCardProps = {
  familyId: string;
  file: MediaFileRow;
  onChanged: () => void;
};

export function MediaCard({ familyId, file, onChanged }: MediaCardProps) {
  const deleteFile = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/media/${file.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete file");
      return res.json();
    },
    onSuccess: onChanged,
  });

  const setCover = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/albums/${file.albumId}/cover`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaFileId: file.id }),
      });
      if (!res.ok) throw new Error("Failed to set cover");
      return res.json();
    },
    onSuccess: onChanged,
  });

  return (
    <div className="rounded-2xl border border-bark shadow-sm overflow-hidden flex flex-col">
      <img src={file.url} alt={file.originalName} className="w-full h-40 object-cover" />
      <div className="p-2 flex justify-between items-center text-xs">
        <button type="button" onClick={() => setCover.mutate()}>
          Set as cover
        </button>
        {file.canDelete && (
          <button type="button" onClick={() => deleteFile.mutate()}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
