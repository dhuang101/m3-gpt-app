export interface ParsedResponse {
	content: string
	reasoning?: string
}

export const Parsers = {
	/**
	 * Strategy 1: Pass-through (For standard models like MedLlama-3 that don't output CoT text)
	 */
	none: (text: string): ParsedResponse => ({
		content: text.trim(),
	}),

	/**
	 * Strategy 2: HTML/XML Tags (For models like DeepSeek-R1 or others using clean boundaries)
	 */
	tags: (
		text: string,
		openTag = "<think>",
		closeTag = "</think>",
	): ParsedResponse => {
		if (!text.includes(openTag)) return { content: text.trim() }

		const parts = text.split(closeTag)
		const reasoning = parts[0].replace(openTag, "").trim()
		const content = parts[1] ? parts[1].trim() : ""

		return { reasoning, content }
	},

	/**
	 * Strategy 3: MedGemma Plaintext Header
	 */
	medgemma15: (text: string): ParsedResponse => {
		if (!text.includes("thought\nThinking Process:")) {
			return { content: text.trim() }
		}

		const cleanText = text.replace(/^thought\nThinking Process:\s*/i, "")

		// Handle the greeting text glue issue: "...assistant.Hello!"
		const gluedMatch = cleanText.match(/\.([A-Z][A-Za-z0-9\s!?,.]{5,})$/)
		if (gluedMatch && gluedMatch.index) {
			const splitIndex = gluedMatch.index + 1
			return {
				reasoning: cleanText.substring(0, splitIndex).trim(),
				content: cleanText.substring(splitIndex).trim(),
			}
		}

		return { content: cleanText.trim() }
	},
}
