import { NextApiRequest, NextApiResponse } from "next"
import ollama, { Message } from "ollama"

type ModelType = "BioMedGPT" | "MedGemma"

interface ParamsType {
	messages: (Message & { images?: string[] })[] // Extend message to allow images
	model: ModelType
}

async function ChatToModel(params: ParamsType) {
	const modelMap: Record<ModelType, string> = {
		BioMedGPT: "biomedgpt",
		MedGemma: "medgemma-vision",
	}
	const selectedModel = modelMap[params.model] || "biomedgpt"

	if (!params.messages || params.messages.length === 0) {
		throw new Error("No messages provided")
	}

	return await ollama.chat({
		model: selectedModel,
		messages: params.messages,
		stream: false,
		think: false,
		options: {
			stop: [
				"[/INST]",
				"</s>",
				"[INST]",
				"<end_of_turn>",
				"<start_of_turn>",
			],
			num_ctx: selectedModel === "medgemma-vision" ? 4096 : 2048,
		},
	})
}

// handler for any calls to this endpoint
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method Not Allowed" })
	}

	const params = req.body as ParamsType

	try {
		const results = await ChatToModel(params)
		res.status(200).json(results.message)
	} catch (err) {
		console.error("Error at chat :", err)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
