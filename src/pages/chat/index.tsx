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
	| "lingshu-7b"
	| "hulu-med-30b"
	| "medix-r1-30b"

function ChatPage() {
	const { data: session } = useSession()

	const [selectedModel, setSelectedModel] =
		useState<AvailableModels>("medgemma-1.5-4b")
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
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
				const base64String = reader.result as string
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
		setError(null)
	}

	async function sendMessage(history: ChatMessage[]) {
		setLoading(true)
		setError(null)
		try {
			const response = await axios.post("/api/chatToModel", {
				messages: history,
				model: selectedModel,
			})
			setMessages((prev) => [...prev, response.data])
		} catch (err) {
			console.error("Error fetching response:", err)
			setError(
				"The model failed to respond. The server may be busy or the context window was exceeded.",
			)
		} finally {
			setLoading(false)
		}
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

			await sendMessage(updatedHistory)
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
											src={message.images[0]}
											alt="Uploaded context"
											className="max-w-xs rounded-lg mb-2 border border-base-content/10"
										/>
									)}

								{message.role === "assistant" ? (
									<div className="flex flex-col gap-2 min-w-0">
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

						{error && (
							<div className="bg-error/10 border border-error/20 text-error w-fit max-w-[85%] p-4 my-2 mr-auto rounded-b-3xl rounded-tr-3xl flex flex-col gap-2">
								<div className="flex items-center gap-2 font-semibold text-sm">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										/>
									</svg>
									Connection Error
								</div>
								<p className="text-xs">{error}</p>
								<button
									onClick={() => sendMessage(messages)}
									className="btn btn-xs btn-error btn-outline w-fit mt-1"
								>
									Retry Request
								</button>
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
