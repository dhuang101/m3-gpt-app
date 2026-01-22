import TextBox from "@/components/Textbox"
import axios from "axios"
import React from "react"
import { useState } from "react"

export default function Home() {
	const [input, setInput] = useState("")
	const [response, setResponse] = useState("")
	const [loading, setLoading] = useState(false)
	const [prevText, setPrevText] = useState<string[]>(["test", "123"])

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		console.log(prevText.length)
		if (event.key === "Enter" && !event.shiftKey && input !== "") {
			setPrevText([...prevText, input])
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

	return (
		<div className="flex flex-col items-center justify-center w-full h-screen bg-base-100">
			{prevText.length > 0 ? (
				<div className="flex flex-col items-center justify-center h-full w-1/2">
					<div className="flex flex-col h-4/5 w-full overflow-y-auto p-8">
						{}
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
