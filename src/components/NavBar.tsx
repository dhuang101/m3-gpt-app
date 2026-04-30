import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

function Navbar() {
	const { data: session } = useSession()
	const pathname = usePathname()

	if (!session) return null

	return (
		<div>
			<div className="fixed top-6 left-8 z-50">
				{pathname === "/chat" && (
					<Link
						href="/"
						className="btn btn-ghost bg-base-200 rounded-full border border-base-300 shadow-sm px-6 hover:bg-base-300 flex items-center gap-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-4 h-4"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
							/>
						</svg>
						Home
					</Link>
				)}
			</div>

			<div className="fixed top-6 right-8 z-50">
				<div className="flex items-center gap-3 bg-base-200 p-2 pl-4 rounded-full border border-base-300 shadow-sm">
					<div className="flex flex-col items-end leading-tight">
						<span className="text-xs font-bold">
							{session.user?.name}
						</span>
						<span className="text-[10px] opacity-60">
							{session.user?.email}
						</span>
					</div>
					<div className="dropdown dropdown-end">
						<label
							tabIndex={0}
							className="btn btn-ghost btn-circle avatar online"
						>
							<div className="w-10 rounded-full">
								<img
									src={
										session.user?.picture ||
										`https://ui-avatars.com/api/?name=${session.user?.name}`
									}
									alt="profile"
								/>
							</div>
						</label>
						<ul
							tabIndex={0}
							className="mt-2 p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52 border border-base-300"
						>
							<li>
								<button
									onClick={() => signOut()}
									className="text-error font-semibold"
								>
									Sign Out
								</button>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Navbar
