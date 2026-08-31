import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    updatedAt: number;
  }

  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    updatedAt: number;
    revoked?: boolean;
  }
}
