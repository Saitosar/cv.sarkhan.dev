import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
import NextAuth from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "google",
      name: "Google",
      type: "oauth",
      authorization: { params: { scope: "openid email profile" } },
      profile: (profile: any) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
    } as any,
    {
      id: "linkedin",
      name: "LinkedIn",
      type: "oauth",
      authorization: { params: { scope: "r_liteprofile r_emailaddress" } },
      profile: (profile: any) => ({
        id: profile.id,
        name: profile.localizedFirstName + " " + profile.localizedLastName,
        email: profile.emailAddress,
        image: profile.picture,
      }),
    } as any,
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
      // @ts-expect-error - user id is available via PrismaAdapter
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
