import { MediaCard, type MediaFileRow } from "./MediaCard";

type MediaGridProps = {
  familyId: string;
  files: MediaFileRow[];
  onChanged: () => void;
};

export function MediaGrid({ familyId, files, onChanged }: MediaGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto ">
      {files.map((file) => (
        <MediaCard key={file.id} familyId={familyId} file={file} onChanged={onChanged} />
      ))}
    </div>
  );
}
