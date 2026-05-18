import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import axios from "axios"

interface LlamaRouterModel {
	id: string
	status: { value: string }
}

async function GetModelStatus() {
	try {
		const response = await axios.get("http://localhost:8080/models")
		const modelList: LlamaRouterModel[] = response.data?.data || []
		const loadedModels = modelList.filter(
			(model) => model.status.value === "loaded",
		)
		const isBusy = loadedModels.length > 0

		return {
			busy: isBusy,
			details: loadedModels.map((model) => ({
				name: model.id,
			})),
		}
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("Llama.cpp connection error:", error.message)
		} else {
			console.error("Unexpected error:", error)
		}

		return { busy: false, error: "llama.cpp router offline" }
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const token = await getToken({ req })
	if (!token) return res.status(401).json({ error: "Unauthorized" })

	try {
		const results = await GetModelStatus()
		res.status(200).json(results)
	} catch (err) {
		console.error("Error at status endpoint:", err)
		res.status(500).json({ error: "Internal Server Error" })
	}
}
