// utils/responseParsers.ts

export interface ParsedResponse {
	content: string
	reasoning?: string
}

export const Parsers = {
	/**
	 * Strategy 1: Pass-through (For standard models that don't output CoT text)
	 */
	none: (text: string): ParsedResponse => ({
		content: text.trim(),
	}),

	/**
	 * Strategy 2: HTML/XML Tags (For models using clean boundaries like <think>)
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
	 * Strategy 3: Overhauled MedGemma Plaintext Parser
	 * Built to catch changing headers and extract massive multi-line clinical markdown blocks.
	 */
	medgemma15: (text: string): ParsedResponse => {
		const trimmed = text.trim()

		if (!trimmed.toLowerCase().startsWith("thought")) {
			return { content: trimmed }
		}

		let cleanText = trimmed.replace(/^thought\s*\n/i, "").trim()

		const responseMarkers = [
			/(\.|\n)\s*(Based on the image)/i,
			/(\.|\n)\s*(Based on the provided)/i,
			/(\.|\n)\s*(Based on the clinical)/i,
			/(\.|\n)\s*(Based on the case)/i,
			/(\.|\n)\s*(The provided image)/i,
			/(\.|\n)\s*(The image shows)/i,
			/(\.|\n)\s*(Hello!)/i,
			/(\.|\n)\s*(Hi there!)/i,
		]

		for (const marker of responseMarkers) {
			const match = cleanText.match(marker)
			if (match && match.index !== undefined) {
				const markerPrefixLength = match[0].length - match[2].length
				const splitIndex = match.index + markerPrefixLength

				return {
					reasoning: cleanText.substring(0, splitIndex).trim(),
					content: cleanText.substring(splitIndex).trim(),
				}
			}
		}

		const gluedSentenceMatch = cleanText.match(/\.([A-Z][A-Za-z\s]{15,})/)
		if (gluedSentenceMatch && gluedSentenceMatch.index !== undefined) {
			const splitIndex = gluedSentenceMatch.index + 1 // Split directly after the period
			return {
				reasoning: cleanText.substring(0, splitIndex).trim(),
				content: cleanText.substring(splitIndex).trim(),
			}
		}

		return { content: cleanText }
	},
}
