"use client";

import type { MediaFileRow } from "./MediaCard";

type MediaLightboxProps = {
  file: MediaFileRow;
  onClose: () => void;
};

export function MediaLightbox({ file, onClose }: MediaLightboxProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-cream text-2xl"
      >
        ✕
      </button>
      <img
        src={file.url}
        alt={file.originalName}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
