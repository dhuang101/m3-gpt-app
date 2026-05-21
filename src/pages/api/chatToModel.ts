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
		systemPrompt?: string // Added to support model-specific system prompts
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
		systemPrompt: `You are MedGemma. You must separate your thinking process from your final response using XML tags.   
            Do not output anything outside of these tags.

            Format your output exactly like this:
            <thinking>
            [Your internal reasoning goes here]
            </thinking>
            <response>
            [Your final answer goes here]
            </response>`,
		parse: Parsers.medgemma15,
	},
	"medgemma-1.0-4b": {
		alias: "medgemma-1.0-4b",
		options: {
			stop: [
				"<start_of_turn>",
				"<end_of_turn>",
				"<|im_end|>",
				"<|file_separator|>",
			],
		},
		systemPrompt: `You are MedGemma, a helpful and accurate medical AI assistant. Provide safe, evidence-based, and 
		objective clinical insights while maintaining a professional and empathetic tone. Always emphasize the importance 
		of professional medical consultation when relevant.`,
		parse: Parsers.none,
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
		systemPrompt: `You are an advanced clinical variant of MedGemma. Leverage your extensive medical knowledge base to 
		analyze clinical inputs, symptoms, or complex health queries. Deliver highly detailed, evidence-based medical information,
		 diagnostic considerations, and rigorous clinical guidance while maintaining strict safety standards.`,
		parse: Parsers.none,
	},
	"medllama-3-8b": {
		alias: "medllama-3-8b",
		options: {
			stop: [
				"<|start_header_id|>",
				"<|end_header_id|>",
				"<|eot_id|>",
				"<|im_end|>",
				"<|endoftext|>",
				"Assistant:",
			],
		},
		systemPrompt: `You are MedLlama, a professional medical AI assistant based on the Llama architecture. 
		Your objective is to assist users and healthcare practitioners with high-quality, precise, and scientifically accurate 
		medical insights. Keep your responses structured, objective, and strictly focused on patient safety and clinical accuracy.`,
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
		systemPrompt: `You are Lingshu, a generalist medical understanding and reasoning AI. Provide highly accurate evaluations 
		of clinical queries, patient symptoms, and medical data. Focus on creating well-structured clinical explanations, precise answers,
		and comprehensive medical text interpretations.`,
		parse: Parsers.none,
	},
	"hulu-med-30b": {
		alias: "hulu-med-30b",
		options: {
			stop: ["<|im_start|>", "<|im_end|>", "USER:", "ASSISTANT:"],
		},
		systemPrompt: `You are Hulu-Med, an expert-level generalist model designed for holistic medical reasoning across complex anatomical
		 systems and diverse clinical modalities. Deliver comprehensive clinical decision-support, detailed medical rationales, and robust,
		 safe, actionable health insights.`,
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
		systemPrompt: `You are Medix-R1, an advanced reasoning model optimized for medical tasks. You must approach queries with a 
		thorough, step-by-step clinical mindset. 

            CRITICAL INSTRUCTION: Place your entire internal clinical reasoning, differential diagnosis formulation, and evaluation of 
			medical evidence exclusively inside <think> and </thought> tags. 
            Once you close the </thought> tag, immediately follow it with your final, structured, and user-facing medical advice or response.`,
		parse: (text) => Parsers.tags(text, "<think>", "</thought>"),
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

	if (selectedConfig.systemPrompt) {
		formattedMessages.unshift({
			role: "system",
			content: selectedConfig.systemPrompt,
		})
	}

	const response = await openai.chat.completions.create({
		model: selectedConfig.alias,
		messages: formattedMessages,
		stop: selectedConfig.options.stop,
		max_tokens: 2048,
		stream: false,
	})

	const rawContent = response.choices[0].message.content || ""

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
