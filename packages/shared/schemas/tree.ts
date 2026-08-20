import { z } from "zod";

export const createPersonSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    birthDate: z.string().optional(),
    deathDate: z.string().optional(),
  })

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

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
