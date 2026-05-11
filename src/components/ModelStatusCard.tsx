interface ModelStatusCardProps {
	activeCount: number
}

function ModelStatusCard({ activeCount }: ModelStatusCardProps) {
	const getStatusConfig = (count: number) => {
		if (count >= 3)
			return {
				color: "bg-error",
				label: "High Load",
				text: "text-error",
				glow: "shadow-[0_0_10px_#ff52d9]",
			}
		if (count === 2)
			return {
				color: "bg-warning",
				label: "Busy",
				text: "text-warning",
				glow: "shadow-[0_0_10px_#ffbe00]",
			}
		if (count <= 1)
			return {
				color: "bg-success",
				label: "Normal",
				text: "text-success",
				glow: "shadow-[0_0_10px_#00ff00]",
			}
		return {
			color: "bg-slate-500",
			label: "Idle",
			text: "text-base-content/50",
			glow: "",
		}
	}

	const config = getStatusConfig(activeCount)

	return (
		<div className="w-full max-w-md bg-base-200/50 rounded-lg p-2.5 border border-base-300 flex items-center justify-between transition-all duration-500">
			<div className="flex items-center gap-2.5">
				<div className="relative flex items-center justify-center">
					<div
						className={`w-3 h-3 rounded-full transition-all duration-700 ${config.color} ${config.glow}`}
					/>
					<div
						className={`absolute w-3 h-3 rounded-full animate-ping opacity-20 ${config.color}`}
					/>
				</div>
				<div>
					<article className="text-sm font-semibold opacity-60 leading-none mb-1">
						Status
					</article>
					<article
						className={`text-xs font-semibold leading-none ${config.text}`}
					>
						{config.label}
					</article>
				</div>
			</div>
			<div className="flex flex-col items-end border-l border-base-300 pl-3">
				<article className="text-[11px] opacity-60 font-bold">
					Active Models
				</article>
				<article className="text-sm font-mono font-black leading-none mt-0.5">
					{activeCount}
				</article>
			</div>
		</div>
	)
}

export default ModelStatusCard
