import { z } from "zod";

export const createFamilySchema = z.object({
  name: z.string().min(1, "Family name is required"),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;

export const updateFamilySchema = z.object({
  name: z.string().min(1, "Family name is required"),
  description: z.string().max(500, "Description is too long").optional(),
  avatarBase64: z.string().nullable().optional(),
});

export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;
