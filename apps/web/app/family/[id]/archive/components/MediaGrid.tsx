"use client";

import { useState } from "react";
import { MediaCard, type MediaFileRow } from "./MediaCard";
import { MediaLightbox } from "./MediaLightbox";

const MAX_SELECTED = 20;

type MediaGridProps = {
  familyId: string;
  files: MediaFileRow[];
  onChanged: () => void;
};

export function MediaGrid({ familyId, files, onChanged }: MediaGridProps) {
  const [previewFile, setPreviewFile] = useState<MediaFileRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECTED) {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDeleteSelected() {
    for (const id of selectedIds) {
      const res = await fetch(`/api/family/${familyId}/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete file");
    }
    setSelectedIds(new Set());
    onChanged();
  }

  async function handleDownloadSelected() {
    const selectedFiles = files.filter((file) => selectedIds.has(file.id));
    for (const file of selectedFiles) {
      const res = await fetch(file.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.originalName;
      link.click();
      URL.revokeObjectURL(blobUrl);
    }
    setSelectedIds(new Set());
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span>{selectedIds.size} selected (max {MAX_SELECTED})</span>
          <button
            type="button"
            onClick={handleDownloadSelected}
            className="bg-bark text-cream px-3 py-1 rounded-lg"
          >
            Download
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="border border-bark px-3 py-1 rounded-lg"
          >
            Delete
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto ">
        {files.map((file) => (
          <MediaCard
            key={file.id}
            file={file}
            selected={selectedIds.has(file.id)}
            onToggleSelect={() => toggleSelect(file.id)}
            onOpen={() => setPreviewFile(file)}
          />
        ))}

        {previewFile && (
          <MediaLightbox file={previewFile} onClose={() => setPreviewFile(null)} />
        )}
      </div>
    </div>
  );
}
