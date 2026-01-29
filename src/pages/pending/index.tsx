function PendingPage() {
	return (
		<div className="flex flex-col items-center justify-center h-screen bg-base-100 text-center p-6">
			<article className="text-3xl font-bold mb-4">
				Account Pending Approval
			</article>
			<article className="max-w-md text-base-content/70">
				Thanks for signing up! Our admins need to manually approve your
				account before you have access. Please contact{" "}
				<span className="font-semibold text-base-content">
					chris.a.bain@monash.edu
				</span>{" "}
				and we will approve your account as soon as possible
			</article>
		</div>
	)
}

export default PendingPage
