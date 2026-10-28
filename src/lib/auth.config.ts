import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "teacher";
      }
      return token;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

