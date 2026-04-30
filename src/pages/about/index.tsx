const MODELS = [
	{
		name: "MedGemma 1.5 4B",
		hfUrl: "https://huggingface.co/google/medgemma-1.5-4b-it",
		dateAdded: "2026-02-10",
	},
	{
		name: "MedGemma 1.0 4B",
		hfUrl: "https://huggingface.co/google/medgemma-4b-it",
		dateAdded: "2026-04-16",
	},
	{
		name: "MedGemma 1.0 27B",
		hfUrl: "https://huggingface.co/google/medgemma-27b-it",
		dateAdded: "2026-04-16",
	},
]

function AboutPage() {
	return (
		<div className="min-h-screen min-w-screen bg-base-100 flex flex-col items-center justify-center p-6">
			<div className="max-w-4xl w-full space-y-8">
				<div className="text-center">
					<article className="text-4xl font-extrabold tracking-tight mb-4">
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
				</div>

				<div className="bg-base-200 p-6 rounded-2xl border border-base-300">
					<h3 className="text-xl font-bold ml-1 mb-4 flex items-center gap-2">
						View Model Details
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{MODELS.map((model, idx) => (
							<div
								key={idx}
								className="bg-base-100 p-5 rounded-xl shadow-sm border border-base-300 flex flex-col justify-between"
							>
								<div>
									<div className="font-bold text-lg mb-1">
										{model.name}
									</div>
									<div className="flex items-center gap-2 mb-4">
										<span className="opacity-50 font-semibold">
											Added:
										</span>
										<span className="opacity-75">
											{model.dateAdded}
										</span>
									</div>
								</div>

								<div className="card-actions justify-start">
									<a
										href={model.hfUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="btn btn-sm btn-primary btn-outline gap-2 normal-case"
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

export default AboutPage
