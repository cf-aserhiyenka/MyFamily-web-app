import { z } from "zod";

export const createRewardSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
  pointCost: z.number().int().positive("Point cost must be positive"),
  stock: z.number().int().nonnegative().optional(),
});

export type CreateRewardInput = z.infer<typeof createRewardSchema>;
