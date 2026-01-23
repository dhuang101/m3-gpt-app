import NextAuth, { User } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

export const authOptions = {
	// Configure one or more authentication providers
	providers: [
		Auth0Provider({
			clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string,
			clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
			issuer: process.env.NEXT_PUBLIC_AUTH0_ISSUER,
		}),
	],
	pages: { signIn: "/auth/signin" },
}

export default NextAuth(authOptions)
