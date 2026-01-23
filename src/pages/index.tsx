import TextBox from "@/components/Textbox"
import axios from "axios"
import React from "react"
import { useState } from "react"

interface ChatMessage {
	role: "user" | "assistant"
	content: string
}

export default function Home() {
	const [input, setInput] = useState("")
	const [loading, setLoading] = useState(false)
	const [messages, setMessages] = useState<ChatMessage[]>([])

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && !event.shiftKey && input.trim() !== "") {
			event.preventDefault()
			const newMessage: ChatMessage = { role: "user", content: input }
			const updatedHistory = [...messages, newMessage]
			setMessages(updatedHistory)
			setInput("")
			setLoading(true)
			axios
				.post("/api/chatToBioMedGPT", {
					messages: updatedHistory,
				})
				.then((response) => {
					const newResponse = response.data
					setMessages((prev) => [...prev, newResponse])
					setLoading(false)
				})
				.catch((error) => {
					console.error("Error fetching response:", error)
					setLoading(false)
				})
		}
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-screen bg-base-100">
			{messages.length > 0 ? (
				<div className="flex flex-col items-center justify-center h-full w-2/5">
					<div className="flex flex-col h-4/5 w-full overflow-y-auto p-8">
						{messages.map((message, i) => {
							if (i % 2 === 0) {
								return (
									<div
										key={i}
										className="bg-base-300 w-fit max-w-2/3 p-4 ml-auto rounded-b-3xl rounded-tl-3xl"
									>
										{message.content}
									</div>
								)
							} else if (i % 2 === 1) {
								return (
									<div
										key={i}
										className="bg-base-200 w-fit p-4 my-4 mr-8 rounded-b-3xl rounded-tr-3xl"
									>
										{message.content}
									</div>
								)
							}
						})}
						{loading && (
							<div className="bg-base-200 w-fit p-4 my-4 mr-8 rounded-b-3xl rounded-tr-3xl">
								<span className="loading loading-dots loading-xl"></span>
							</div>
						)}
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
