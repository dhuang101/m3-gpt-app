// types/next-auth.d.ts
import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
	interface Session {
		user: {
			name?: string | null
			email?: string | null
			picture?: string | null
			approved?: boolean | null
		}
	}
	interface User {}
}

declare module "next-auth/jwt" {
	interface JWT {
		role?: string
		email?: string
	}
}
