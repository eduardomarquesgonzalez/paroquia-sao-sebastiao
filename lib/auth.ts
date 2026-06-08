import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) return null;

        // Bloqueia contas inativas, suspensas ou sem verificação
        if (user.status !== "ACTIVE") return null;

        return {
          id:     user.id,
          email:  user.email,
          name:   user.name,
          role:   user.role,
          status: user.status,
          image:  user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role   = user.role;
        token.id     = user.id;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role   = token.role   as string;
        session.user.id     = token.id     as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
};
