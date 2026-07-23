import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["PARENT", "CHILD", "GUARDIAN", "SENIOR"]),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
