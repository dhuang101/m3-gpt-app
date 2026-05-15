import Link from "next/link"
import { Image, MessageSquareText } from "lucide-react"

const MODELS = [
	{
		name: "MedGemma 1.5 4B",
		hfUrl: "https://huggingface.co/google/medgemma-1.5-4b-it",
		dateAdded: "2026-02-10",
		hasImageSupport: true,
	},
	{
		name: "MedGemma 1.0 4B",
		hfUrl: "https://huggingface.co/google/medgemma-4b-it",
		dateAdded: "2026-04-16",
		hasImageSupport: true,
	},
	{
		name: "MedGemma 1.0 27B",
		hfUrl: "https://huggingface.co/google/medgemma-27b-it",
		dateAdded: "2026-04-16",
		hasImageSupport: true,
	},
	{
		name: "MedLlama 3 8B",
		hfUrl: "https://huggingface.co/johnsnowlabs/JSL-MedLlama-3-8B-v2.0",
		dateAdded: "2026-04-30",
		hasImageSupport: false,
	},
	{
		name: "Lingshu 7B",
		hfUrl: "https://huggingface.co/lingshu-medical-mllm/Lingshu-7B",
		dateAdded: "2026-05-14",
		hasImageSupport: true,
	},
]

function HomePage() {
	return (
		<div className="min-h-screen min-w-screen bg-base-100 flex flex-col items-center justify-center">
			<div className="max-w-5xl w-full space-y-8">
				<div className="text-center">
					<article className="text-3xl font-extrabold tracking-tight mb-3">
						Monash Uni FIT Medical Gen AI Sandbox
					</article>
					<article className="text-lg opacity-75 max-w-2xl mx-auto">
						This project is a sandbox environment for testing
						generative AI models in the medical domain. It aims to
						provide clinicians with easy access to powerful models
						for various medical applications, such as clinical
						decision support, medical research, and patient
						education. The sandbox allows users to interact with
						different models, compare their performance, and explore
						their capabilities.
					</article>
					<div className="mt-6">
						<Link
							href="/chat"
							className="btn btn-primary btn-lg px-8 shadow-lg hover:shadow-xl transition-all"
						>
							Open Gen AI Sandbox
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4 ml-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</Link>
					</div>
				</div>

				<div className="bg-base-200 p-4 rounded-2xl border border-base-300">
					<h3 className="text-md font-bold ml-1 mb-3 opacity-50 ">
						Available Models
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{MODELS.map((model, idx) => (
							<div
								key={idx}
								className="bg-base-100 p-3.5 rounded-lg shadow-sm border border-base-300 flex flex-col justify-between hover:border-primary/40 transition-all group"
							>
								<div>
									<div className="flex justify-between items-start mb-1">
										<div className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">
											{model.name}
										</div>
										<div
											className="tooltip tooltip-bottom"
											data-tip={
												model.hasImageSupport
													? "Supports Vision/Images"
													: "Text-only model"
											}
										>
											{model.hasImageSupport ? (
												<Image
													size={18}
													className="text-primary"
												/>
											) : (
												<MessageSquareText
													size={18}
													className="opacity-30"
												/>
											)}
										</div>
									</div>

									<div className="flex items-center gap-1 opacity-75">
										<span className="text-xs font-semibold">
											Added
										</span>
										<span className="text-xs">
											{model.dateAdded}
										</span>
									</div>
								</div>

								<div className="card-actions justify-start">
									<a
										href={model.hfUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="btn btn-xs btn-primary btn-outline gap-2 normal-case mt-2"
									>
										View on Hugging Face
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-4 h-4"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
											/>
										</svg>
									</a>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default HomePage
