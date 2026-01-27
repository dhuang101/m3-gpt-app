import { ChatResponse } from "@/components/ChatResponse"
import TextBox from "@/components/Textbox"
import axios from "axios"
import React from "react"
import { useState } from "react"

interface ChatMessage {
	role: "user" | "assistant"
	content: string
}

type AvailableModels = "BioMedGPT" | "MedVLM"

export default function Home() {
	const [selectedModel, setSelectedModel] =
		useState<AvailableModels>("BioMedGPT")
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [loading, setLoading] = useState(false)

	function resetConversation() {
		setMessages([])
		setInput("")
		setLoading(false)
	}

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
					<div className="flex w-full my-4">
						<button
							onClick={resetConversation}
							className="btn btn-outline rounded-full border-base-300 text-base-content hover:bg-error hover:text-white transition-all"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-4 h-4 mr-2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
								/>
							</svg>
							New Chat
						</button>
					</div>
					<div className="flex flex-col h-4/5 w-full overflow-y-auto p-8 mb-4">
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
										<ChatResponse
											content={message.content}
										/>
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
						selectedModel={selectedModel}
						setSelectedModel={setSelectedModel}
					/>
					<article className="my-2 text-sm text-base-300">
						LLMs can make mistakes, so double-check it
					</article>
				</div>
			) : (
				<div className="flex items-center justify-center w-1/2">
					<TextBox
						handleKeyDown={handleKeyDown}
						input={input}
						setInput={setInput}
						selectedModel={selectedModel}
						setSelectedModel={setSelectedModel}
					/>
				</div>
			)}
		</div>
	)
}
