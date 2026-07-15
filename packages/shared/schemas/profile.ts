import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
