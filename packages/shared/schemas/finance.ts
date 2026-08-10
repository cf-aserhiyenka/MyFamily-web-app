import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.coerce.date(),
  note: z.string().trim().optional(),
  budgetId: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  budgetId: z.string().nullable().optional(),
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export const createBudgetSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.enum([
    "GROCERIES",
    "BILLS",
    "EDUCATION",
    "HEALTH",
    "ENTERTAINMENT",
    "TRANSPORT",
    "OTHER",
  ]),
  limitAmount: z.number().positive("Limit must be positive"),
  period: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = createBudgetSchema.partial();

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export const createSavingGoalSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  targetAmount: z.number().positive("Target must be positive"),
  deadline: z.coerce.date().optional(),
});

export type CreateSavingGoalInput = z.infer<typeof createSavingGoalSchema>;

export const updateSavingGoalSchema = createSavingGoalSchema.partial().extend({
  deadline: z.coerce.date().nullable().optional(),
  isAchieved: z.boolean().optional(),
});

export type UpdateSavingGoalInput = z.infer<typeof updateSavingGoalSchema>;

export const createContributionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  note: z.string().trim().optional(),
});

export type CreateContributionInput = z.infer<typeof createContributionSchema>;
