import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null; // ← allow null or undefined
  }
}
