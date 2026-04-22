import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import ollama from "ollama"

async function GetLlmStatus() {
	try {
		const status = await ollama.ps()
		const isBusy = status.models.length > 0

		return {
			busy: isBusy,
			details: status.models.map((model) => ({
				name: model.name,
				size: model.size,
				expiresAt: model.expires_at, // Tells you when it will auto-unload
			})),
		}
	} catch (error) {
		console.error("Failed to reach Ollama:", error)
		return { busy: false, error: "Ollama offline" }
	}
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

	try {
		const results = await GetLlmStatus()
		res.status(200).json(results)
	} catch (err) {
		console.error("Error at status :", err)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
