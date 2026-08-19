import { describe, expect, it } from "vitest";
import {
  createBudgetSchema,
  createExpenseSchema,
  updateBudgetSchema,
} from "./finance";

describe("createExpenseSchema", () => {
  it("accepts a valid expense", () => {
    const result = createExpenseSchema.safeParse({
      title: "Groceries",
      amount: 42.5,
      date: "2026-08-19",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a zero or negative amount", () => {
    const result = createExpenseSchema.safeParse({
      title: "Groceries",
      amount: 0,
      date: "2026-08-19",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a title that is only whitespace (trimmed to empty)", () => {
    const result = createExpenseSchema.safeParse({
      title: "   ",
      amount: 10,
      date: "2026-08-19",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a date string that cannot be coerced to a real date", () => {
    const result = createExpenseSchema.safeParse({
      title: "Groceries",
      amount: 10,
      date: "not-a-date",
    });

    expect(result.success).toBe(false);
  });
});

describe("createBudgetSchema", () => {
  it("accepts a valid budget", () => {
    const result = createBudgetSchema.safeParse({
      name: "Household",
      category: "GROCERIES",
      limitAmount: 500,
      period: "MONTHLY",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a category outside the allowed enum", () => {
    const result = createBudgetSchema.safeParse({
      name: "Household",
      category: "VACATION",
      limitAmount: 500,
      period: "MONTHLY",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a negative limit amount", () => {
    const result = createBudgetSchema.safeParse({
      name: "Household",
      category: "GROCERIES",
      limitAmount: -100,
      period: "MONTHLY",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateBudgetSchema", () => {
  it("allows a partial update with a single field", () => {
    const result = updateBudgetSchema.safeParse({ name: "Renamed budget" });

    expect(result.success).toBe(true);
  });

  it("still rejects an invalid value for a field that is present", () => {
    const result = updateBudgetSchema.safeParse({ limitAmount: -1 });

    expect(result.success).toBe(false);
  });

  it("accepts an empty object since every field is optional", () => {
    const result = updateBudgetSchema.safeParse({});

    expect(result.success).toBe(true);
  });
});
