import { NextApiRequest, NextApiResponse } from "next"
import ollama from "ollama"

async function ChatToBioMedGPT(params: any) {
	return await ollama.chat({
		model: "biomedgpt",
		messages: [{ role: "user", content: params.message }],
		stream: false,
	})
}

// handler for any calls to this endpoint
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const params = req.body as any

	try {
		const results = await ChatToBioMedGPT(params)
		res.status(200).json(results)
	} catch (err) {
		console.error("Error at chat :", err)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
