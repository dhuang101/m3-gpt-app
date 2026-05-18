import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import ollama from "ollama"

async function GetModelStatus() {
	try {
		const response = await fetch(`http://localhost:8080/models`)
		if (!response.ok) throw new Error("Failed to query models")

		const data = await response.json()

		const loadedModels = data.models.filter(
			(m: any) => m.status === "loaded",
		)
		const isBusy = loadedModels.length > 0

		return {
			busy: isBusy,
			details: loadedModels.map((model: any) => ({
				name: model.id,
				size: model.meta?.size || "Unknown",
				expiresAt: model.expires_at || "Dynamic Eviction",
			})),
		}
	} catch (error) {
		console.error("Failed to reach llama.cpp router:", error)
		return { busy: false, error: "llama.cpp router offline" }
	}
}

// handler for any calls to this endpoint
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const token = await getToken({ req })
	if (!token) {
		return res.status(401).json({
			error: "Unauthorized: Please sign in to access this resource",
		})
	}

	try {
		const results = await GetModelStatus()
		res.status(200).json(results)
	} catch (err) {
		console.error("Error at status :", err)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
