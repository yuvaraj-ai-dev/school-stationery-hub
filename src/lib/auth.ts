import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import { getUsers, getUserByEmail, createUser, updateUserRole, updateUserLastLogin } from "@/lib/db";
import { AppUser } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const allUsers = await getUsers();
        const existing = allUsers.find((u) => u.email === user.email);
        const isFirstUser = allUsers.length === 0 || (allUsers.length === 1 && allUsers[0].email === user.email);

        if (!existing) {
          await createUser({
            email: user.email,
            name: user.name || "Unknown",
            role: isFirstUser ? "admin" : "teacher",
            profile_image: user.image || "",
            last_login: new Date().toISOString(),
          });
        } else {
          // If this is the only registered user and not yet admin, promote them automatically
          if (isFirstUser && existing.role !== "admin") {
            await updateUserRole(user.email, "admin");
          }
          await updateUserLastLogin(user.email);
        }
        return true;
      } catch {
        return true; // allow sign in even if sheets aren't set up yet
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await getUserByEmail(user.email);
          token.role = dbUser?.role || "teacher";
        } catch {
          token.role = "teacher";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || "teacher";
      }
      return session;
    },
  },
});
