import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Props {
	content: string
}

export const ChatResponse = ({ content }: Props) => {
	return (
		<div
			className="prose prose-slate max-w-none dark:prose-invert wrap-break-word min-w-0"
			style={{ overflowWrap: "anywhere" }}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					// Format code blocks
					code({ node, inline, className, children, ...props }: any) {
						return !inline ? (
							<pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
								<code {...props}>{children}</code>
							</pre>
						) : (
							<code
								className="bg-gray-200 dark:bg-gray-800 px-1 rounded break-all"
								{...props}
							>
								{children}
							</code>
						)
					},
					// Format tables for readability
					table: ({ children }) => (
						<div className="overflow-x-auto my-4 border border-gray-300 rounded-lg">
							<table className="border-collapse w-full">
								{children}
							</table>
						</div>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	)
}
