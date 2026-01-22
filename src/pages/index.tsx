import axios from "axios"
import { useState } from "react"

export default function Home() {
	const [input, setInput] = useState("")
	const [response, setResponse] = useState("")
	const [loading, setLoading] = useState(false)

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && !event.shiftKey && input !== "") {
			setLoading(true)
			axios
				.post("/api/chatToBioMedGPT", {
					message: input,
				})
				.then((response) => {
					setResponse(response.data.message.content)
					setLoading(false)
				})
		}
	}

	function handleInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
		const element = event.target
		element.style.height = "auto"
		element.style.height = `${element.scrollHeight}px`
		setInput(element.value)
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-screen bg-base-100">
			<article>{response}</article>
			<div className="flex flex-col items-center w-full max-w-2xl px-4 py-2 bg-base-200 rounded-4xl border border-base-content/10 focus-within:border-base-content/20 transition-all ">
				<textarea
					placeholder="Ask BioMedGPT"
					className="textarea textarea-ghost focus:outline-none focus:bg-transparent border-none w-full min-h-12 overflow-hidden text-base-content placeholder:text-base-content/50 px-2 text-lg resize-none leading-7 max-h-53 overflow-y-auto"
					onKeyDown={handleKeyDown}
					onChange={handleInput}
					rows={1}
				/>
				<div className="flex justify-between w-full px-2 mt-2">
					<button className="btn btn-ghost btn-circle btn-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-5 h-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
					</button>

					<div className="flex">
						<button className="btn btn-ghost btn-circle btn-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-5 h-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
								/>
							</svg>
						</button>

						<button className="btn btn-ghost btn-circle btn-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-5 h-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
