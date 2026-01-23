import { NextApiRequest, NextApiResponse } from "next"
import ollama, { Message } from "ollama"

interface ParamsType {
	messages: Message[]
}

async function ChatToBioMedGPT(params: ParamsType) {
	return await ollama.chat({
		model: "biomedgpt",
		messages: params.messages,
		stream: false,
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
		const results = await ChatToBioMedGPT(params)
		res.status(200).json(results.message)
	} catch (err) {
		console.error("Error at chat :", err)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
