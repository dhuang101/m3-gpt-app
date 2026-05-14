import React, { useRef } from "react"

{
	/* Required Change: add the new model here */
}
const MODEL_NAMES = {
	"medgemma-1.5-4b": "MedGemma 1.5 (4b)",
	"medgemma-1.0-4b": "MedGemma 1.0 (4b)",
	"medgemma-1.0-27b": "MedGemma 1.0 (27b)",
	"medllama-3-8b": "MedLlama 3 (8b)",
	"lingshu-7b": "Lingshu (7b)",
	"hulu-med-30b": "Hulu-Med (30b)",
	"medix-r1-30b": "MediX R1 (30b)",
}

interface PropsType {
	handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
	input: string
	setInput: React.Dispatch<React.SetStateAction<string>>
	selectedModel:
		| "medgemma-1.5-4b"
		| "medgemma-1.0-4b"
		| "medgemma-1.0-27b"
		| "medllama-3-8b"
		| "lingshu-7b"
		| "hulu-med-30b"
		| "medix-r1-30b"
	setSelectedModel: React.Dispatch<
		React.SetStateAction<
			| "medgemma-1.5-4b"
			| "medgemma-1.0-4b"
			| "medgemma-1.0-27b"
			| "medllama-3-8b"
			| "lingshu-7b"
			| "hulu-med-30b"
			| "medix-r1-30b"
		>
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
	const isVisionSupported = selectedModel.includes("medgemma")

	function handleInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
		const element = event.target
		element.style.height = "auto"
		element.style.height = `${element.scrollHeight}px`
		setInput(element.value)
	}

	function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
		// Required Change: add new model's name here
		const value = event.target.value as
			| "medgemma-1.5-4b"
			| "medgemma-1.0-4b"
			| "medgemma-1.0-27b"
			| "medllama-3-8b"
			| "lingshu-7b"
			| "hulu-med-30b"
			| "medix-r1-30b"
		if (!value.includes("medgemma") && selectedImage) {
			clearImage()
		}

		setSelectedModel(value)
	}

	function handleImageButtonClick() {
		if (isVisionSupported) {
			fileInputRef.current?.click()
		}
	}

	return (
		<div className="relative w-full max-w-2xl">
			<div className="flex flex-col items-center w-full px-4 py-2 bg-base-200 rounded-4xl border border-base-content/10 focus-within:border-base-content/20 transition-all">
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
					placeholder={`Ask ${MODEL_NAMES[selectedModel]}`}
					className="textarea textarea-ghost focus:outline-none focus:bg-transparent border-none w-full min-h-12 overflow-hidden text-base-content placeholder:text-base-content/50 px-2 text-lg resize-none leading-7 max-h-53 overflow-y-auto"
					value={input}
					onKeyDown={handleKeyDown}
					onChange={handleInput}
					rows={1}
				/>

				<div className="flex justify-between w-full px-2 mt-2">
					<div
						className="tooltip tooltip-accent tooltip-bottom"
						data-tip={
							isVisionSupported
								? "Upload Image"
								: "Vision not supported for this model"
						}
					>
						<input
							type="file"
							className="hidden"
							ref={fileInputRef}
							disabled={!isVisionSupported}
							onChange={(e) =>
								e.target.files?.[0] &&
								onImageUpload(e.target.files[0])
							}
							accept="image/*"
						/>

						<button
							onClick={handleImageButtonClick}
							disabled={!isVisionSupported}
							className={`btn btn-ghost btn-circle hover:bg-base-300 btn-sm 
                                ${selectedImage ? "text-primary" : ""} 
                                ${!isVisionSupported ? "btn-disabled opacity-60" : ""}`}
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
								{`${MODEL_NAMES[selectedModel]}`}
							</div>
						) : (
							<select
								className="bg-base-200 w-fit select select-ghost focus:outline-none"
								value={selectedModel}
								onChange={handleSelectChange}
							>
								{/* Required Change: add the new model here, this is the dropdown where it will be selected*/}
								<option value="medgemma-1.5-4b">
									MedGemma-1.5-4b-it-Q4_K_M
								</option>
								<option value="medgemma-1.0-4b">
									MedGemma-1.0-4b-it-Q4_K_M
								</option>
								<option value="medgemma-1.0-27b">
									MedGemma-1.0-27b-it-Q6_K
								</option>
								<option value="medllama-3-8b">
									MedLlama-3-8B-v2.0-Q4_K_M
								</option>
								<option value="lingshu-7b">
									Lingshu-7B.i1-Q4_K_M
								</option>
								<option value="hulu-med-30b">
									Hulu-Med-30A3.i1-Q4_K_M
								</option>
								<option value="medix-r1-30b">
									MediX-R1-30B.i1-Q4_K_M
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
