/* eslint-disable import/no-extraneous-dependencies */
import bcrypt from "bcryptjs";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaClient } from "~/generated/prisma";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { email, password } = credentials;

        const adminCount = await prisma.admin.count();
        if (adminCount === 0) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newAdmin = await prisma.admin.create({
            data: { email, password: hashedPassword },
          });
          return { id: newAdmin.id.toString(), email: newAdmin.email };
        }

        const user = await prisma.admin.findUnique({ where: { email } });
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user.id.toString(), email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const, // ✅ fix TS error
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email ?? null, // ← converts undefined to null
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
