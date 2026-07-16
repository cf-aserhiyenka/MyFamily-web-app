import { z } from "zod";

// Mirrors the Prisma `FamilyRole` enum. Kept as a plain string union here
// (not imported from @myfamily/db) so packages/shared has no dependency on
// the db package, same pattern as the other schemas in this folder.
export const createInvitationSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["PARENT", "CHILD", "GUARDIAN", "SENIOR"]),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
