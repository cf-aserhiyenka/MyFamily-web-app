import { describe, expect, it } from "vitest";
import { loginSchema } from "./login";

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty password (unlike register, no minimum length here)", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({
      email: "user@",
      password: "anything",
    });

    expect(result.success).toBe(false);
  });
});
