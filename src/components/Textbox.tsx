interface PropsType {
	handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
	input: string
	setInput: React.Dispatch<React.SetStateAction<string>>
	selectedModel: "BioMedGPT" | "MedVLM"
	setSelectedModel: React.Dispatch<
		React.SetStateAction<"BioMedGPT" | "MedVLM">
	>
}

function TextBox({
	handleKeyDown,
	input,
	setInput,
	selectedModel,
	setSelectedModel,
}: PropsType) {
	function handleInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
		const element = event.target
		element.style.height = "auto"
		element.style.height = `${element.scrollHeight}px`
		setInput(element.value)
	}

	function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const value = event.target.value as "BioMedGPT" | "MedVLM"
		setSelectedModel(value)
	}

	return (
		<div className="flex flex-col items-center w-full max-w-2xl px-4 py-2 bg-base-200 rounded-4xl border border-base-content/10 focus-within:border-base-content/20 transition-all ">
			<textarea
				placeholder={`Ask ${selectedModel}`}
				className="textarea textarea-ghost focus:outline-none focus:bg-transparent border-none w-full min-h-12 overflow-hidden text-base-content placeholder:text-base-content/50 px-2 text-lg resize-none leading-7 max-h-53 overflow-y-auto"
				value={input}
				onKeyDown={handleKeyDown}
				onChange={handleInput}
				rows={1}
			/>
			<div className="flex justify-between w-full px-2 mt-2">
				<div>
					<button className="btn btn-ghost btn-circle hover:bg-base-300 btn-sm">
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

				<div className="flex">
					<select
						className="bg-base-200 w-fit select select-ghost focus:outline-none"
						value={selectedModel}
						onChange={handleSelectChange}
					>
						<option value="BioMedGPT">
							BioMedGPT-LM-7B.Q4_K_M
						</option>
						<option value="MedVLM">MedVLM-R1.Q4_K_M</option>
					</select>
				</div>
			</div>
		</div>
	)
}

export default TextBox
