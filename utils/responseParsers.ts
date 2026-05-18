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

		// Escape tags safely for Regex
		const escapedOpen = openTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
		const escapedClose = closeTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

		// Regex to capture full blocks
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

		// Fallback: If the open tag exists but the closing tag was cut off due to token limits
		if (trimmed.includes(openTag)) {
			const parts = trimmed.split(openTag)
			return {
				reasoning: parts[1] ? parts[1].trim() : "",
				content: "", // No final response was generated yet
			}
		}

		return { content: trimmed }
	},

	/**
	 * Strategy 3: Dedicated XML Response Wrapper Parser
	 * Specifically built for your new MedGemma 1.5 prompt that outputs <thinking> and <response>
	 */
	medgemma15: (text: string): ParsedResponse => {
		const trimmed = text.trim()

		// 1. Check for our explicit new XML <response> structure first
		const responseMatch = trimmed.match(
			/<response>([\s\\S]*?)<\/response>/i,
		)
		const thinkingMatch = trimmed.match(
			/<thinking>([\s\\S]*?)<\/thinking>/i,
		)

		if (responseMatch) {
			return {
				reasoning: thinkingMatch ? thinkingMatch[1].trim() : undefined,
				content: responseMatch[1].trim(),
			}
		}

		// 2. Legacy Fallback: If the model fell back to raw text with headers
		if (/thinking|thought/i.test(trimmed.slice(0, 50))) {
			// Find common boundaries where "Final Response" style text breaks away
			const legacyMarker = trimmed.match(
				/(Final Output:|Response:|<response>|Hello!|Based on the)/i,
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
		}

		return { content: trimmed }
	},
}
