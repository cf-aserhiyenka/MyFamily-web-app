import { z } from "zod";

export const createPersonSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    birthDate: z.string().optional(),
    deathDate: z.string().optional(),
  })

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

export const updatePersonSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  maidenName: z.string().max(100, "Maiden name is too long").optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().max(200, "Birth place is too long").optional(),
  deathDate: z.string().optional(),
  deathPlace: z.string().max(200, "Death place is too long").optional(),
  occupation: z.string().max(200, "Occupation is too long").optional(),
  bio: z.string().max(1000, "Bio is too long").optional(),
  avatarBase64: z.string().nullable().optional(),
});

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;

export const createRelationSchema = z
  .object({
    personAId: z.string().min(1),
    personBId: z.string().min(1),
    relation: z.enum(["PARENT_OF", "PARTNER_OF", "SIBLING_OF"]),
  })
  .refine((data) => data.personAId !== data.personBId, {
    message: "Cannot relate a person to themselves",
    path: ["personBId"],
  });

export type CreateRelationInput = z.infer<typeof createRelationSchema>;
