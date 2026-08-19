import { describe, expect, it } from "vitest";
import { createGroupConversationSchema, sendMessageSchema } from "./message";

describe("sendMessageSchema", () => {
  it("accepts normal message content", () => {
    const result = sendMessageSchema.safeParse({ content: "Hello family!" });

    expect(result.success).toBe(true);
  });

  it("rejects content that is empty after trimming", () => {
    const result = sendMessageSchema.safeParse({ content: "   " });

    expect(result.success).toBe(false);
  });

  it("rejects content longer than 2000 characters", () => {
    const result = sendMessageSchema.safeParse({ content: "a".repeat(2001) });

    expect(result.success).toBe(false);
  });

  it("accepts content at exactly the 2000 character limit", () => {
    const result = sendMessageSchema.safeParse({ content: "a".repeat(2000) });

    expect(result.success).toBe(true);
  });
});

describe("createGroupConversationSchema", () => {
  it("accepts a valid group name with at least one member", () => {
    const result = createGroupConversationSchema.safeParse({
      name: "Weekend trip",
      memberIds: ["member-1"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a group with no members selected", () => {
    const result = createGroupConversationSchema.safeParse({
      name: "Weekend trip",
      memberIds: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a group name longer than 100 characters", () => {
    const result = createGroupConversationSchema.safeParse({
      name: "a".repeat(101),
      memberIds: ["member-1"],
    });

    expect(result.success).toBe(false);
  });
});
