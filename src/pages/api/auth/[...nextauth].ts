import NextAuth, { Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import Auth0Provider from "next-auth/providers/auth0"

export const authOptions = {
	// Configure one or more authentication providers
	providers: [
		Auth0Provider({
			clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string,
			clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
			issuer: process.env.NEXT_PUBLIC_AUTH0_ISSUER,

			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					approved:
						profile["https://chat.m3-gpt.cloud.edu.au/approved"] ||
						false,
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }: { token: JWT; user?: User }) {
			if (user) {
				token.approved = (user as any).approved
			}
			return token
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			session.user.approved = token.approved as boolean
			return session
		},
	},
	pages: { signIn: "/auth/signin" },
}

export default NextAuth(authOptions)
