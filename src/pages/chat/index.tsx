import { ChatResponse } from "@/components/ChatResponse"
import TextBox from "@/components/Textbox"
import axios from "axios"
import React, { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import useSWR from "swr"
import ModelStatusCard from "@/components/ModelStatusCard"
import Link from "next/link"

interface ChatMessage {
	role: "user" | "assistant"
	content: string
	images?: string[]
}

type AvailableModels =
	| "medgemma-1.5-4b"
	| "medgemma-1.0-4b"
	| "medgemma-1.0-27b"
	| "medllama-3-8b"

function ChatPage() {
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
			refreshInterval: 15000,
			revalidateOnFocus: true,
		},
	)
	const activeCount = status?.details?.length || 0

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
					<div className="flex w-full my-4 items-center justify-between">
						<button
							onClick={resetConversation}
							className="btn btn-outline rounded-full border-base-300 text-base-content hover:bg-error hover:text-white transition-all"
						>
							New Chat
						</button>
						<ModelStatusCard activeCount={activeCount} />
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
									<div className="flex flex-col gap-2">
										<ChatResponse
											content={message.content}
										/>
										{i === messages.length - 1 && (
											<Link
												href={
													process.env
														.NEXT_PUBLIC_FEEDBACK_FORM_URL as string
												}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 mt-1 self-start"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 16 16"
													fill="currentColor"
													className="w-3 h-3"
												>
													<path d="M2 10a4 4 0 0 1 4-4h4V4.5a.5.5 0 0 1 .854-.354l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.854-.354V9H6a2 2 0 0 0-2 2v.5a.5.5 0 0 1-1 0V10Z" />
												</svg>
												Provide Feedback
											</Link>
										)}
									</div>
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
				<div className="flex flex-col items-center justify-center w-1/2 gap-4">
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
					<ModelStatusCard activeCount={activeCount} />
				</div>
			)}
		</div>
	)
}

export default ChatPage
