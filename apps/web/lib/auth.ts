import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@myfamily/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          updatedAt: user.updatedAt.getTime(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.updatedAt = user.updatedAt;
        return token;
      }

      const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
      if (!dbUser || !dbUser.isActive || dbUser.updatedAt.getTime() !== token.updatedAt) {
        token.revoked = true;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.revoked) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
