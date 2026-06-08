import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      status: string
    }
  }

  interface User {
    role: string
    status: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
    status: string
  }
}
