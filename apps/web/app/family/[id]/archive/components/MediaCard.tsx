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
  selected: boolean;
  onToggleSelect: () => void;
  onChanged: () => void;
  onOpen: () => void;
};

export function MediaCard({
  familyId,
  file,
  selected,
  onToggleSelect,
  onChanged,
  onOpen,
}: MediaCardProps) {
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

  return (
    <div className="rounded-2xl border border-bark shadow-sm overflow-hidden flex flex-col">
      <img
        src={file.url}
        alt={file.originalName}
        loading="lazy"
        className="w-full h-40 object-cover cursor-pointer"
        onClick={onOpen}
      />
      <div className="p-2 flex justify-between items-center text-xs">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} />
        {file.canDelete && (
          <button type="button" onClick={() => deleteFile.mutate()}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
