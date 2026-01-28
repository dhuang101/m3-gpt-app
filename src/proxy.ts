import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
	const { pathname } = req.nextUrl

	// Public paths
	const publicPaths = ["/auth/signin", "/pending"]

	if (publicPaths.includes(pathname)) {
		return NextResponse.next()
	}

	// redirect users that are not signed in
	if (!token) {
		return NextResponse.redirect(new URL("/auth/signin", req.url))
	} else if (!token.approved) {
		return NextResponse.redirect(new URL("/pending", req.url))
	} else {
		return NextResponse.next()
	}
}

export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
