import TextBox from "@/components/Textbox"
import axios from "axios"
import React from "react"
import { useState } from "react"

export default function Home() {
	const [input, setInput] = useState("")
	const [loading, setLoading] = useState(false)
	const [prevText, setPrevText] = useState<string[]>([])

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && !event.shiftKey && input.trim() !== "") {
			event.preventDefault()
			setPrevText((prev) => [...prev, input])
			setLoading(true)
			axios
				.post("/api/chatToBioMedGPT", {
					message: input,
				})
				.then((response) => {
					const newResponse = response.data.message.content
					setPrevText((prev) => [...prev, newResponse])
					setLoading(false)
				})
				.catch((error) => {
					console.error("Error fetching response:", error)
					setLoading(false)
				})
			setInput("")
		}
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-screen bg-base-100">
			{prevText.length > 0 ? (
				<div className="flex flex-col items-center h-full w-1/2">
					<div className="flex flex-col h-4/5 w-full overflow-y-auto p-8">
						{prevText.map((text, i) => {
							if (i % 2 === 0) {
								return (
									<div
										key={i}
										className="bg-base-300 w-fit max-w-2/3 p-4 ml-auto rounded-b-3xl rounded-tl-3xl"
									>
										{text}
									</div>
								)
							} else if (i % 2 === 1) {
								return (
									<div
										key={i}
										className="bg-base-200 w-fit p-4 my-4 mr-8 rounded-b-3xl rounded-tr-3xl"
									>
										{text}
									</div>
								)
							}
						})}
					</div>
					<TextBox
						handleKeyDown={handleKeyDown}
						input={input}
						setInput={setInput}
					/>
					<article className="mt-4 text-sm text-base-300">
						disclaimer area
					</article>
				</div>
			) : (
				<div className="flex items-center justify-center w-1/2">
					<TextBox
						handleKeyDown={handleKeyDown}
						input={input}
						setInput={setInput}
					/>
				</div>
			)}
		</div>
	)
}
