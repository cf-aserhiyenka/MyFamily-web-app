"use client";

export type MediaFileRow = {
  id: string;
  albumId: string;
  originalName: string;
  url: string;
  canDelete: boolean;
};

type MediaCardProps = {
  file: MediaFileRow;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
};

export function MediaCard({ file, selected, onToggleSelect, onOpen }: MediaCardProps) {
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
      </div>
    </div>
  );
}
