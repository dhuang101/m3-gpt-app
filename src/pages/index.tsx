import { ChatResponse } from "@/components/ChatResponse"
import TextBox from "@/components/Textbox"
import axios from "axios"
import React, { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import useSWR from "swr" // Import SWR

interface ChatMessage {
	role: "user" | "assistant"
	content: string
	images?: string[]
}

// Required Change: add the new model's frontend name here
type AvailableModels =
	| "medgemma-1.5-4b"
	| "medgemma-1.0-4b"
	| "medgemma-1.0-27b"

export default function Home() {
	const { data: session } = useSession()

	const [selectedModel, setSelectedModel] =
		useState<AvailableModels>("medgemma-1.5-4b")
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [loading, setLoading] = useState(false)
	const [selectedImage, setSelectedImage] = useState<string | null>(null)

	const { data: status } = useSWR(
		"/api/getModelStatus",
		(url: string) => axios.get(url).then((res) => res.data),
		{
			refreshInterval: 5000, // Poll every 5 seconds
			revalidateOnFocus: true,
		},
	)
	const activeCount = status?.details?.length || 0
	const getStatusConfig = (count: number) => {
		if (count >= 3)
			return { color: "bg-error", label: "High Load", text: "text-error" }
		if (count === 2)
			return { color: "bg-warning", label: "Busy", text: "text-warning" }
		if (count === 1)
			return {
				color: "bg-success",
				label: "Normal",
				text: "text-success",
			}
		return {
			color: "bg-slate-500",
			label: "Idle",
			text: "text-base-content/50",
		}
	}
	const statusConfig = getStatusConfig(activeCount)

	const convertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => {
				const base64String = (reader.result as string).split(",")[1]
				resolve(base64String)
			}
			reader.onerror = (error) => reject(error)
		})
	}

	function resetConversation() {
		setMessages([])
		setInput("")
		setSelectedImage(null)
		setLoading(false)
	}

	async function handleKeyDown(
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) {
		if (
			event.key === "Enter" &&
			!event.shiftKey &&
			(input.trim() !== "" || selectedImage)
		) {
			event.preventDefault()

			const newMessage: ChatMessage = {
				role: "user",
				content: input,
				...(selectedImage && { images: [selectedImage] }),
			}

			const updatedHistory = [...messages, newMessage]
			setMessages(updatedHistory)
			setInput("")
			setSelectedImage(null)
			setLoading(true)

			try {
				const response = await axios.post("/api/chatToModel", {
					messages: updatedHistory,
					model: selectedModel,
				})
				setMessages((prev) => [...prev, response.data])
			} catch (error) {
				console.error("Error fetching response:", error)
			} finally {
				setLoading(false)
			}
		}
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-screen bg-base-100 relative">
			{messages.length > 0 ? (
				<div className="flex flex-col items-center justify-center h-full w-2/5">
					<div className="flex w-full my-4">
						<button
							onClick={resetConversation}
							className="btn btn-outline rounded-full border-base-300 text-base-content hover:bg-error hover:text-white transition-all"
						>
							New Chat
						</button>
					</div>

					<div className="flex flex-col h-4/5 w-full overflow-y-auto p-8 mb-4">
						{messages.map((message, i) => (
							<div
								key={i}
								className={`${
									message.role === "user"
										? "bg-base-300 ml-auto rounded-b-3xl rounded-tl-3xl"
										: "bg-base-200 mr-auto rounded-b-3xl rounded-tr-3xl"
								} w-fit max-w-[85%] p-4 my-2`}
							>
								{message.images &&
									message.images.length > 0 && (
										<img
											src={`data:image/jpeg;base64,${message.images[0]}`}
											alt="Uploaded context"
											className="max-w-xs rounded-lg mb-2 border border-base-content/10"
										/>
									)}

								{message.role === "assistant" ? (
									<ChatResponse content={message.content} />
								) : (
									<p className="whitespace-pre-wrap">
										{message.content}
									</p>
								)}
							</div>
						))}
						{loading && (
							<div className="bg-base-200 w-fit p-4 my-4 mr-8 rounded-b-3xl rounded-tr-3xl">
								<span className="loading loading-dots loading-md"></span>
							</div>
						)}
					</div>

					<TextBox
						handleKeyDown={handleKeyDown}
						input={input}
						setInput={setInput}
						selectedModel={selectedModel}
						setSelectedModel={setSelectedModel}
						selectedImage={selectedImage}
						onImageUpload={async (file) => {
							const base64 = await convertToBase64(file)
							setSelectedImage(base64)
						}}
						clearImage={() => setSelectedImage(null)}
						isChatting={true}
					/>
					<article className="my-2 text-sm text-base-300 italic text-center">
						Medical LLMs can make mistakes. Always consult a
						professional.
					</article>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center w-1/2">
					<TextBox
						handleKeyDown={handleKeyDown}
						input={input}
						setInput={setInput}
						selectedModel={selectedModel}
						setSelectedModel={setSelectedModel}
						selectedImage={selectedImage}
						onImageUpload={async (file) => {
							const base64 = await convertToBase64(file)
							setSelectedImage(base64)
						}}
						clearImage={() => setSelectedImage(null)}
						isChatting={false}
					/>
					<div className="mt-4 w-full max-w-md bg-base-200/50 rounded-xl p-3 border border-base-300 flex items-center justify-between transition-all duration-500">
						<div className="flex items-center gap-3">
							<div className="flex gap-1.5 p-1 bg-black/10 rounded-full">
								<div
									className={`w-3 h-3 rounded-full transition-all duration-500 ${activeCount >= 3 ? "bg-error shadow-[0_0_8px_#ff52d9]" : "bg-error/20"}`}
								/>
								<div
									className={`w-3 h-3 rounded-full transition-all duration-500 ${activeCount === 2 ? "bg-warning shadow-[0_0_8px_#ffbe00]" : "bg-warning/20"}`}
								/>
								<div
									className={`w-3 h-3 rounded-full transition-all duration-500 ${activeCount === 1 ? "bg-success shadow-[0_0_8px_#00ff00]" : "bg-success/20"}`}
								/>
							</div>
							<div>
								<p className="text-xs font-bold uppercase tracking-wider opacity-60">
									System Status
								</p>
								<p
									className={`text-sm font-medium ${statusConfig.text}`}
								>
									{statusConfig.label}
								</p>
							</div>
						</div>

						<div className="text-right">
							<p className="text-[10px] uppercase opacity-50">
								Active Models
							</p>
							<p className="text-lg font-mono font-bold leading-none">
								{activeCount}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
