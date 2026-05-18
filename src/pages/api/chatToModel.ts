import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import OpenAI from "openai"

export const config = {
	maxDuration: 120,
}

type ModelType =
	| "medgemma-1.5-4b"
	| "medgemma-1.0-4b"
	| "medgemma-1.0-27b"
	| "medllama-3-8b"
	| "lingshu-7b"

interface ModelOptions {
	stop: string[]
	num_ctx: number
}

interface ModelRegistry {
	[key: string]: {
		options: ModelOptions
		baseURL: string
		alias: string
	}
}

const MODEL_REGISTRY: ModelRegistry = {
	"medgemma-1.5-4b": {
		baseURL: "http://localhost:8080/v1",
		alias: "medgemma-1.5",
		options: {
			stop: [
				"<|im_start|>user",
				"<|im_start|>system",
				"<|im_end|>",
				"<end_of_turn>",
			],
			num_ctx: 32768,
		},
	},
	"medgemma-1.0-4b": {
		baseURL: "http://localhost:8080/v1",
		alias: "medgemma-1.0-4b",
		options: {
			stop: [
				"<start_of_turn>",
				"<end_of_turn>",
				"<|im_end|>",
				"<|file_separator|>",
			],
			num_ctx: 8192,
		},
	},
	"medgemma-1.0-27b": {
		baseURL: "http://localhost:8080/v1",
		alias: "medgemma-1.0-27b",
		options: {
			stop: [
				"<start_of_turn>",
				"<end_of_turn>",
				"<|im_end|>",
				"<|file_separator|>",
			],
			num_ctx: 16384,
		},
	},
	"medllama-3-8b": {
		baseURL: "http://localhost:8080/v1",
		alias: "medllama-3",
		options: {
			stop: [
				"<|start_header_id|>",
				"<|end_header_id|>",
				"<|eot_id|>",
				"<|reserved_special_token",
				"Assistant:",
			],
			num_ctx: 16384,
		},
	},
	"lingshu-7b": {
		baseURL: "http://localhost:8080/v1",
		alias: "lingshu-vision",
		options: {
			stop: [
				"<|im_start|>",
				"<|im_end|>",
				"<|object_ref_start|>",
				"<|object_ref_end|>",
				"<|endoftext|>",
			],
			num_ctx: 8192,
		},
	},
}

interface IncomingMessage {
	role: "user" | "assistant"
	content: string
	images?: string[]
}

interface ParamsType {
	messages: IncomingMessage[]
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

	const openai = new OpenAI({
		baseURL: selectedConfig.baseURL,
		apiKey: "local-no-key-required",
	})

	const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] =
		params.messages.map((msg) => {
			if (msg.images && msg.images.length > 0) {
				return {
					role: "user" as const,
					content: [
						{
							type: "text" as const,
							text: msg.content,
						},
						{
							type: "image_url" as const,
							image_url: {
								url: msg.images[0],
							},
						},
					],
				}
			}
			if (msg.role === "user") {
				return {
					role: "user" as const,
					content: msg.content,
				}
			} else {
				return {
					role: "assistant" as const,
					content: msg.content,
				}
			}
		})

	const response = await openai.chat.completions.create({
		model: selectedConfig.alias,
		messages: formattedMessages,
		stop: selectedConfig.options.stop,
		max_tokens: 2048,
		stream: false,
	})

	return {
		role: "assistant" as const,
		content: response.choices[0].message.content || "",
	}
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
		const assistantMessage = await ChatToModel(params)
		res.status(200).json(assistantMessage)
	} catch (err: any) {
		console.error("Error with OpenAI SDK route processing:", err)
		res.status(500).json({ error: err?.message || "Internal Server Error" })
	}
}
