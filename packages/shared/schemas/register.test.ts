import { describe, expect, it } from "vitest";
import { registerSchema } from "./register";

describe("registerSchema", () => {
  it("accepts a valid email and a password of at least 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "short1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a payload missing required fields", () => {
    const result = registerSchema.safeParse({ email: "user@example.com" });

    expect(result.success).toBe(false);
  });
});
