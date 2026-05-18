// utils/responseParsers.ts

export interface ParsedResponse {
	content: string
	reasoning?: string
}

export const Parsers = {
	/**
	 * Strategy 1: Pass-through
	 * For standard models that don't output CoT text at all.
	 */
	none: (text: string): ParsedResponse => ({
		content: text.trim(),
	}),

	/**
	 * Strategy 2: Flexible XML/HTML Tags (Highly Robust)
	 * For models using explicit structural boundaries (like <thinking> or <think>).
	 * Safely handles situations where the model forgets or cuts off the closing tag.
	 */
	tags: (
		text: string,
		openTag = "<thinking>",
		closeTag = "</thinking>",
	): ParsedResponse => {
		const trimmed = text.trim()

		const escapedOpen = openTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
		const escapedClose = closeTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

		const fullPattern = new RegExp(
			`${escapedOpen}([\\s\\S]*?)${escapedClose}([\\s\\S]*)`,
		)
		const match = trimmed.match(fullPattern)

		if (match) {
			return {
				reasoning: match[1].trim(),
				content: match[2].trim(),
			}
		}

		if (trimmed.includes(openTag)) {
			const parts = trimmed.split(openTag)
			return {
				reasoning: parts[1] ? parts[1].trim() : "",
				content: "",
			}
		}

		return { content: trimmed }
	},

	/**
	 * Strategy 3: MedGemma XML Parser
	 * Handles pre-text leaks, nested markdown code blocks, and cleans up residual tags.
	 */
	medgemma15: (text: string): ParsedResponse => {
		const trimmed = text.trim()

		// 1. Surgical strike regex to look for <response> anywhere in the string,
		// even inside markdown code blocks or behind random prose text.
		const responseMatch = trimmed.match(/<response>([\s\S]*?)<\/response>/i)
		const thinkingMatch = trimmed.match(/<thinking>([\s\S]*?)<\/thinking>/i)

		if (responseMatch) {
			let content = responseMatch[1].trim()
			let reasoning = thinkingMatch ? thinkingMatch[1].trim() : undefined

			// If no clean <thinking> block was extracted but there was random junk text
			// BEFORE the <response> tag, treat that junk text as the reasoning trail.
			if (!reasoning && trimmed.toLowerCase().includes("<response>")) {
				const parts = trimmed.split(/<response>/i)
				// Clean up any stray code blocks or markdown artifacts from the junk text
				reasoning = parts[0]
					.replace(/```xml|```/g, "")
					.replace(/<thinking>/i, "")
					.trim()
			}

			// Quick sanitation check: clean out any stray backticks that leaked into the content block
			content = content.replace(/```/g, "").trim()

			return {
				reasoning: reasoning || undefined,
				content: content,
			}
		}

		const legacyMarker = trimmed.match(
			/(Final Output:|Response:|Hello!|Based on the)/i,
		)
		if (legacyMarker && legacyMarker.index !== undefined) {
			return {
				reasoning: trimmed
					.substring(0, legacyMarker.index)
					.replace(/^(thought|thinking process):?/i, "")
					.trim(),
				content: trimmed
					.substring(legacyMarker.index)
					.replace(/^[^\s]+:\s*/i, "")
					.trim(),
			}
		}

		return { content: trimmed }
	},
}
