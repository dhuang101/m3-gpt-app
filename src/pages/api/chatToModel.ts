import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import ollama, { Message } from "ollama"

export const config = {
	maxDuration: 60,
}

type ModelType =
	| "medgemma-1.5-4b"
	| "medgemma-1.0-4b"
	| "medgemma-1.0-27b"
	| "medllama-3-8b"

interface ModelOptions {
	stop: string[]
	num_ctx: number
}

interface ModelRegistry {
	[key: string]: {
		options: ModelOptions
	}
}

const MODEL_REGISTRY: ModelRegistry = {
	"medgemma-1.5-4b": {
		options: {
			stop: [
				"<|im_start|>user",
				"<|im_start|>system",
				"<|im_end|>",
				"<end_of_turn>",
			],
			num_ctx: 16384,
		},
	},
	"medgemma-1.0-4b": {
		options: {
			stop: [
				"<|im_start|>user",
				"<|im_start|>system",
				"<|im_end|>",
				"<end_of_turn>",
			],
			num_ctx: 8192,
		},
	},
	"medgemma-1.0-27b": {
		options: {
			stop: [
				"<|im_start|>user",
				"<|im_start|>system",
				"<|im_end|>",
				"<end_of_turn>",
			],
			num_ctx: 16384,
		},
	},
	"medllama-3-8b": {
		options: {
			stop: [
				"<|start_header_id|>",
				"<|end_header_id|>",
				"<|eot_id|>",
				"<|reserved_special_token",
			],
			num_ctx: 16384,
		},
	},
}

interface ParamsType {
	messages: (Message & { images?: string[] })[]
	model: ModelType
}

async function ChatToModel(params: ParamsType) {
	const selectedModel = params.model as ModelType
	const selectedConfig = MODEL_REGISTRY[selectedModel]

	if (!selectedConfig) {
		throw new Error(`Model ${selectedModel} not found in registry`)
	}

	if (!params.messages || params.messages.length === 0) {
		throw new Error("No messages provided")
	}

	return await ollama.chat({
		model: selectedModel,
		messages: params.messages,
		stream: false,
		keep_alive: "1h",
		options: {
			...selectedConfig.options,
		},
	})
}

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
