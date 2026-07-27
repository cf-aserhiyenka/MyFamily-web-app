import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  role: z.enum(["PARENT", "CHILD", "GUARDIAN", "SENIOR"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
