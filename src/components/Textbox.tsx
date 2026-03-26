import React, { useRef, useState } from "react"

interface PropsType {
	handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
	input: string
	setInput: React.Dispatch<React.SetStateAction<string>>
	// Required Change: add new model's name here
	selectedModel: "BioMedGPT" | "MedGemma"
	setSelectedModel: React.Dispatch<
		React.SetStateAction<"BioMedGPT" | "MedGemma">
	>
	selectedImage: string | null
	onImageUpload: (file: File) => void
	clearImage: () => void
	isChatting: boolean
}

function TextBox({
	handleKeyDown,
	input,
	setInput,
	selectedModel,
	setSelectedModel,
	selectedImage,
	onImageUpload,
	clearImage,
	isChatting,
}: PropsType) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [showAlert, setShowAlert] = useState(false)

	function handleInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
		const element = event.target
		element.style.height = "auto"
		element.style.height = `${element.scrollHeight}px`
		setInput(element.value)
	}

	function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
		// Required Change: add new model's name here
		const value = event.target.value as "BioMedGPT" | "MedGemma"
		setSelectedModel(value)
		// Required Change: if the new model doesn't allow images add it to this conditional
		if (value === "BioMedGPT") clearImage()
	}

	function handleImageButtonClick() {
		// Required Change: if the new model doesn't allow images add it to this conditional
		if (selectedModel === "BioMedGPT") {
			setShowAlert(true)
			setTimeout(() => setShowAlert(false), 3000)
			return
		}
		fileInputRef.current?.click()
	}

	return (
		<div className="relative w-full max-w-2xl">
			{showAlert && (
				<div
					role="alert"
					className="alert alert-warning shadow-lg mb-4 absolute -top-16 transition-all"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					{/* Required Change: if the new model doesn't allow images you can add it to this alert*/}
					<span>BioMedGPT does not support images.</span>
				</div>
			)}

			<div className="flex flex-col items-center w-full px-4 py-2 bg-base-200 rounded-4xl border border-base-content/10 focus-within:border-base-content/20 transition-all ">
				{selectedImage && (
					<div className="relative self-start m-2 group">
						<img
							src={`data:image/jpeg;base64,${selectedImage}`}
							alt="Preview"
							className="w-20 h-20 object-cover rounded-xl border border-base-content/20"
						/>
						<button
							onClick={clearImage}
							className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
						>
							✕
						</button>
					</div>
				)}

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
						<input
							type="file"
							className="hidden"
							ref={fileInputRef}
							onChange={(e) =>
								e.target.files?.[0] &&
								onImageUpload(e.target.files[0])
							}
							accept="image/*"
						/>
						<button
							onClick={handleImageButtonClick}
							className={`btn btn-ghost btn-circle hover:bg-base-300 btn-sm ${selectedImage ? "text-primary" : ""}`}
						>
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

					<div className="flex items-center">
						{isChatting ? (
							<div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-base-content/70 bg-base-300 rounded-xl">
								<div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
								{/* Required Change: add the new model here, ternary syntax can be confusing use AI if you get confused*/}
								{selectedModel === "BioMedGPT"
									? "BioMedGPT-LM-7B"
									: "MedGemma-1.5-4b"}
							</div>
						) : (
							<select
								className="bg-base-200 w-fit select select-ghost focus:outline-none"
								value={selectedModel}
								onChange={handleSelectChange}
							>
								{/* Required Change: add the new model here, this is the dropdown where it will be selected*/}
								<option value="BioMedGPT">
									BioMedGPT-LM-7B.Q4_K_M
								</option>
								<option value="MedGemma">
									MedGemma-1.5-4b-it-Q4_K_M
								</option>
							</select>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default TextBox
