import { ChatResponse } from "@/components/ChatResponse"
import TextBox from "@/components/Textbox"
import axios from "axios"
import React, { useState } from "react"
import { useSession, signOut } from "next-auth/react"

interface ChatMessage {
	role: "user" | "assistant"
	content: string
	images?: string[]
}

type AvailableModels = "BioMedGPT" | "MedGemma"

export default function Home() {
	const { data: session } = useSession()

	const [selectedModel, setSelectedModel] =
		useState<AvailableModels>("BioMedGPT")
	const [input, setInput] = useState("")
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [loading, setLoading] = useState(false)
	const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
			<div className="absolute top-6 right-8 flex items-center gap-4 z-50">
				{session?.user && (
					<div className="flex items-center gap-3 bg-base-200 p-2 pl-4 rounded-full border border-base-300 shadow-sm">
						<div className="flex flex-col items-end leading-tight">
							<span className="text-xs font-bold">
								{session.user.name}
							</span>
							<span className="text-[10px] opacity-60">
								{session.user.email}
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
											session.user.image ||
											`https://ui-avatars.com/api/?name=${session.user.name}`
										}
										alt="profile"
									/>
								</div>
							</label>
							<ul
								tabIndex={0}
								className="mt-4 p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52 border border-base-300"
							>
								<li>
									<a>Settings</a>
								</li>
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
				)}
			</div>

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
					/>
					<article className="my-2 text-sm text-base-300 italic text-center">
						Medical LLMs can make mistakes. Always consult a
						professional.
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
						selectedImage={selectedImage}
						onImageUpload={async (file) => {
							const base64 = await convertToBase64(file)
							setSelectedImage(base64)
						}}
						clearImage={() => setSelectedImage(null)}
					/>
				</div>
			)}
		</div>
	)
}
