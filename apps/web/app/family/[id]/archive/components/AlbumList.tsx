"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export type AlbumRow = {
  id: string;
  name: string;
  type: "DEFAULT" | "CUSTOM";
  fileCount: number;
  canDelete: boolean;
};

type AlbumListProps = {
  familyId: string;
  albums: AlbumRow[];
  selectedAlbumId: string;
  onSelect: (albumId: string) => void;
  onChanged: () => void;
};

export function AlbumList({
  familyId,
  albums,
  selectedAlbumId,
  onSelect,
  onChanged,
}: AlbumListProps) {
  const [newAlbumOpen, setNewAlbumOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  const createAlbum = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/family/${familyId}/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAlbumName }),
      });
      if (!res.ok) throw new Error("Failed to create album");
      return res.json();
    },
    onSuccess: () => {
      setNewAlbumName("");
      setNewAlbumOpen(false);
      onChanged();
    },
  });

  const deleteAlbum = useMutation({
    mutationFn: async (albumId: string) => {
      const res = await fetch(`/api/family/${familyId}/albums/${albumId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete album");
      return res.json();
    },
    onSuccess: (_data, deletedAlbumId) => {
      if (selectedAlbumId === deletedAlbumId) {
        const fallback = albums.find((album) => album.id !== deletedAlbumId);
        if (fallback) onSelect(fallback.id);
      }
      onChanged();
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onSelect("all")}
        className={
          "text-left px-3 py-2 rounded-lg font-medium " +
          (selectedAlbumId === "all" ? "bg-bark text-cream" : "")
        }
      >
        All photos
      </button>

      {albums.map((album) => (
        <div key={album.id} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(album.id)}
            className={
              "flex-1 text-left px-3 py-2 rounded-lg " +
              (selectedAlbumId === album.id ? "bg-bark text-cream" : "")
            }
          >
            {album.name} ({album.fileCount})
          </button>
          {album.canDelete && (
            <button
              type="button"
              onClick={() => {
                const defaultAlbum = albums.find((a) => a.type === "DEFAULT");
                const ok = confirm(
                  `Delete album "${album.name}"? Photos inside will move to "${defaultAlbum?.name ?? "the default album"}", not be deleted.`
                );
                if (ok) deleteAlbum.mutate(album.id);
              }}
              className="text-xs"
            >
              Delete
            </button>
          )}
        </div>
      ))}

      {newAlbumOpen ? (
        <form
          className="flex flex-col gap-2 border border-bark rounded-lg p-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (createAlbum.isPending) return;
            createAlbum.mutate();
          }}
        >
          <input
            type="text"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            placeholder="Album name"
            className="border border-bark rounded-lg px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createAlbum.isPending}
              className="bg-bark text-cream px-3 py-1 rounded-lg text-sm disabled:opacity-50"
            >
              {createAlbum.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setNewAlbumOpen(false)}
              className="border border-bark px-3 py-1 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setNewAlbumOpen(true)}
          className="text-left px-3 py-2 rounded-lg border border-bark text-sm"
        >
          + New album
        </button>
      )}
    </div>
  );
}
