import { useSession, signOut } from "next-auth/react"

function Navbar() {
	const { data: session } = useSession()

	if (!session) return null

	return (
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
	)
}

export default Navbar
