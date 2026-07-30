import { z } from "zod";

export const requestUploadUrlSchema = z.object({
  filename: z.string().trim().min(1, "Filename is required"),
  contentType: z.enum(["image/jpeg", "image/png"]),
  albumId: z.string().optional(),
});

export type RequestUploadUrlInput = z.infer<typeof requestUploadUrlSchema>;

export const createMediaFileSchema = z.object({
  storageKey: z.string().trim().min(1, "Storage key is required"),
  originalName: z.string().trim().min(1, "Original name is required"),
  mimeType: z.string(),
  sizeBytes: z.number().int(),
  albumId: z.string().optional(),
});

export type CreateMediaFileInput = z.infer<typeof createMediaFileSchema>;

export const createAlbumSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional(),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
