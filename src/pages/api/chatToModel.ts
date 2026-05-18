import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import OpenAI from "openai"
import { ParsedResponse, Parsers } from "../../../utils/responseParsers"

export const config = {
	maxDuration: 120,
}

type ModelType =
	| "medgemma-1.5-4b"
	| "medgemma-1.0-4b"
	| "medgemma-1.0-27b"
	| "medllama-3-8b"
	| "lingshu-7b"
	| "hulu-med-30b"
	| "medix-r1-30b"

interface ModelOptions {
	stop: string[]
}

interface ModelRegistry {
	[key: string]: {
		options: ModelOptions
		alias: string
		parse: (text: string) => ParsedResponse
	}
}

const MODEL_REGISTRY: ModelRegistry = {
	"medgemma-1.5-4b": {
		alias: "medgemma-1.5-4b",
		options: {
			stop: [
				"<|im_start|>user",
				"<|im_start|>system",
				"<|im_end|>",
				"<end_of_turn>",
			],
		},
		parse: Parsers.medgemma15,
	},
	"medgemma-1.0-27b": {
		alias: "medgemma-1.0-27b",
		options: {
			stop: [
				"<start_of_turn>",
				"<end_of_turn>",
				"<|im_end|>",
				"<|file_separator|>",
			],
		},
		parse: Parsers.none,
	},
	"medllama-3-8b": {
		alias: "medllama-3-8b",
		options: {
			stop: [
				"<|start_header_id|>",
				"<|end_header_id|>",
				"<|eot_id|>",
				"Assistant:",
			],
		},
		parse: Parsers.none,
	},
	"lingshu-7b": {
		alias: "lingshu-7b",
		options: {
			stop: [
				"<|im_start|>",
				"<|im_end|>",
				"<|object_ref_start|>",
				"<|endoftext|>",
			],
		},
		parse: Parsers.none,
	},
	"hulu-med-30b": {
		alias: "hulu-med-30b",
		options: {
			stop: ["<|im_start|>", "<|im_end|>", "USER:", "ASSISTANT:"],
		},
		parse: Parsers.none,
	},
	"medix-r1-30b": {
		alias: "medix-r1-30b",
		options: {
			stop: [
				"<|im_start|>",
				"<|im_end|>",
				"</thought>",
				"<|endoftext|>",
				"User:",
			],
		},
		parse: Parsers.none,
	},
}

interface IncomingMessage {
	role: "user" | "assistant" | "system"
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
		baseURL: "http://localhost:8080/v1",
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

			return {
				role: msg.role,
				content: msg.content,
			} as OpenAI.Chat.ChatCompletionMessageParam
		})

	const response = await openai.chat.completions.create({
		model: selectedConfig.alias,
		messages: formattedMessages,
		stop: selectedConfig.options.stop,
		max_tokens: 2048,
		stream: false,
	})

	const rawContent = response.choices[0].message.content || ""

	// Clean parser execution handed off to your external module
	const { content, reasoning } = selectedConfig.parse(rawContent)

	return {
		role: "assistant" as const,
		content: content,
		reasoning: reasoning,
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
