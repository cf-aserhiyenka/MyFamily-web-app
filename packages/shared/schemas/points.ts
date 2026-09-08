import { z } from "zod";

export const manualPointAdjustmentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z
    .number()
    .int()
    .refine((v) => v !== 0, "Amount cannot be zero"),
  reason: z.string().trim().min(1, "Reason is required").max(200),
});

export type ManualPointAdjustmentInput = z.infer<typeof manualPointAdjustmentSchema>;
