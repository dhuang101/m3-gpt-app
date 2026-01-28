import { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {}

export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
