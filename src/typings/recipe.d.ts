interface Recipe {
	contentHash: string
	ingredients: string
	instructions: string
	metadata: Record<string, unknown>
	originalContent: string
	pathHash: string
	title: string
}
