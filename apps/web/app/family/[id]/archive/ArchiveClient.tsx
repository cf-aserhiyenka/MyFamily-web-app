"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlbumList, type AlbumRow } from "./components/AlbumList";
import { MediaGrid } from "./components/MediaGrid";
import { UploadTile } from "./components/UploadTile";
import type { MediaFileRow } from "./components/MediaCard";

type ArchiveClientProps = {
  familyId: string;
  albums: AlbumRow[];
  initialAlbumId: string;
  initialFiles: MediaFileRow[];
};

export function ArchiveClient({
  familyId,
  albums,
  initialAlbumId,
  initialFiles,
}: ArchiveClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAlbumId, setSelectedAlbumId] = useState(initialAlbumId);

  const { data } = useQuery({
    queryKey: ["media", familyId, selectedAlbumId],
    queryFn: async () => {
      const res = await fetch(`/api/family/${familyId}/media?albumId=${selectedAlbumId}`);
      if (!res.ok) throw new Error("Failed to load files");
      return res.json() as Promise<{ files: MediaFileRow[] }>;
    },
    initialData: selectedAlbumId === initialAlbumId ? { files: initialFiles } : undefined,
  });

  function refreshMedia() {
    queryClient.invalidateQueries({ queryKey: ["media", familyId, selectedAlbumId] });
  }

  function refreshAlbums() {
    router.refresh();
  }

  return (
    <main className="h-screen flex overflow-hidden">
      <aside className="w-64 border-r border-bark p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Albums</h2>
        <AlbumList
          familyId={familyId}
          albums={albums}
          selectedAlbumId={selectedAlbumId}
          onSelect={setSelectedAlbumId}
          onChanged={refreshAlbums}
        />
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 pb-2 shrink-0">
          <UploadTile
            familyId={familyId}
            albumId={selectedAlbumId}
            onUploaded={() => {
              refreshMedia();
              refreshAlbums();
            }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          <MediaGrid
            familyId={familyId}
            files={data?.files ?? []}
            onChanged={() => {
              refreshMedia();
              refreshAlbums();
            }}
          />
        </div>
      </section>
    </main>
  );
}
