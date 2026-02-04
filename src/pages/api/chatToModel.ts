import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import ollama, { Message } from "ollama"

export const config = {
	maxDuration: 60,
}

// Required Change: add the new model's name as named in the frontend here
type ModelType = "BioMedGPT" | "MedGemma"

interface ModelOptions {
	stop: string[]
	num_ctx: number
}

interface ModelRegistry {
	[key: string]: {
		options: ModelOptions
	}
}

// Required Change: add a new key with the same name as the model in Ollama, then add the options: stop=stop tags aligned with ModelFile, num_ctx=context size
const MODEL_REGISTRY: ModelRegistry = {
	"medgemma-vision": {
		options: {
			stop: [
				"<|im_start|>user",
				"<|im_start|>system",
				"<|im_end|>",
				"<end_of_turn>",
			],
			num_ctx: 4096,
		},
	},
	biomedgpt: {
		options: {
			stop: ["[/INST]", "</s>", "[INST]", "<|eot_id|>"],
			num_ctx: 2048,
		},
	},
}

interface ParamsType {
	messages: (Message & { images?: string[] })[] // Extend message to allow images
	model: ModelType
}

async function ChatToModel(params: ParamsType) {
	// Required Change: add the new model to the map in this format frontendName: ollamaName
	const modelMap: Record<ModelType, string> = {
		BioMedGPT: "biomedgpt",
		MedGemma: "medgemma-vision",
	}

	const selectedModel = modelMap[params.model] || "biomedgpt"
	const selectedConfig = MODEL_REGISTRY[selectedModel]

	if (!params.messages || params.messages.length === 0) {
		throw new Error("No messages provided")
	}

	return await ollama.chat({
		model: selectedModel,
		messages: params.messages,
		stream: false,
		keep_alive: "1h",
		think: false,
		options: {
			...selectedConfig.options,
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

	const token = await getToken({ req })
	if (!token) {
		return res.status(401).json({
			error: "Unauthorized: Please sign in to access this resource",
		})
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
