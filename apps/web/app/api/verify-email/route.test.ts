import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@myfamily/db";
import { POST } from "./route";

// Integration test — hits the real test database (family_db_test),
// not mocked. Covers the DB logic route.ts can't get from unit tests alone:
// the transaction that marks both User and EmailVerificationToken.

function verifyRequest(token: string) {
  return new Request("http://localhost/api/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

async function createUserWithToken(options: {
  tokenExpiresAt: Date;
  tokenUsedAt?: Date;
}) {
  const user = await prisma.user.create({
    data: {
      email: "verify-test@example.com",
      passwordHash: "irrelevant-for-this-test",
    },
  });

  const token = await prisma.emailVerificationToken.create({
    data: {
      token: "test-token-123",
      email: user.email,
      userId: user.id,
      expiresAt: options.tokenExpiresAt,
      usedAt: options.tokenUsedAt,
    },
  });

  return { user, token };
}

describe("POST /api/verify-email", () => {
  beforeEach(async () => {
    // clean slate before every test — token first, it has the FK to user
    await prisma.emailVerificationToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("verifies the user for a valid, unused, non-expired token", async () => {
    const { user } = await createUserWithToken({
      tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const response = await POST(verifyRequest("test-token-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.emailVerified).not.toBeNull();

    const updatedToken = await prisma.emailVerificationToken.findUnique({
      where: { token: "test-token-123" },
    });
    expect(updatedToken?.usedAt).not.toBeNull();
  });

  it("rejects an expired token and leaves the user unverified", async () => {
    const { user } = await createUserWithToken({
      tokenExpiresAt: new Date(Date.now() - 60 * 60 * 1000),
    });

    const response = await POST(verifyRequest("test-token-123"));

    expect(response.status).toBe(400);

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.emailVerified).toBeNull();
  });

  it("rejects an already-used token", async () => {
    await createUserWithToken({
      tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      tokenUsedAt: new Date(),
    });

    const response = await POST(verifyRequest("test-token-123"));

    expect(response.status).toBe(400);
  });

  it("rejects a token that doesn't exist", async () => {
    const response = await POST(verifyRequest("no-such-token"));

    expect(response.status).toBe(400);
  });
});
