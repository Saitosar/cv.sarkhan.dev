import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { NextAuthOptions } from "next-auth"
import { prisma } from "@/lib/db/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "google",
      name: "Google",
      type: "oauth",
      authorization: { params: { scope: "openid email profile" } },
      signIn: async (params) => {
        // Minimal OAuth flow for Google
        return "/auth/callback/google"
      },
      // Note: Real implementation requires full OAuth config. 
      // For P0, we implement the structure.
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      type: "oauth",
      authorization: { params: { scope: "r_liteprofile r_emailaddress" } },
      signIn: async (params) => {
        return "/auth/callback/linkedin"
      },
    },
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
}

export default NextAuth(authOptions)
