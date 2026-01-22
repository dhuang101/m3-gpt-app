import TextBox from "@/components/Textbox"
import axios from "axios"
import React from "react"
import { useState } from "react"

export default function Home() {
	const [input, setInput] = useState("")
	const [loading, setLoading] = useState(false)
	const [prevText, setPrevText] = useState<string[]>([])

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && !event.shiftKey && input !== "") {
			event.preventDefault()
			setPrevText([...prevText, input])
			setLoading(true)
			axios
				.post("/api/chatToBioMedGPT", {
					message: input,
				})
				.then((response) => {
					setPrevText([...prevText, response.data.message.content])
					setLoading(false)
				})
		}
	}

	return (
		<div className="flex flex-col items-center justify-center w-full h-screen bg-base-100">
			{prevText.length > 0 ? (
				<div className="flex flex-col items-center justify-center h-full w-1/2">
					<div className="flex flex-col h-4/5 w-full overflow-y-auto p-8">
						{prevText.map((text, i) => {
							if (i % 2 === 0) {
								return (
									<div
										key={i}
										className="bg-base-200 w-fit p-4 ml-auto rounded-b-xl rounded-tl-xl"
									>
										{text}
									</div>
								)
							} else if (i % 2 === 1) {
								return (
									<div key={i} className="mt-2 mr-8">
										{text}
									</div>
								)
							}
						})}
					</div>
					<TextBox
						handleKeyDown={handleKeyDown}
						setInput={setInput}
					/>
				</div>
			) : (
				<div className="flex items-center justify-center w-1/2">
					<TextBox
						handleKeyDown={handleKeyDown}
						setInput={setInput}
					/>
				</div>
			)}
		</div>
	)
}
