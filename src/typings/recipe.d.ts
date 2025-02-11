export interface Recipe {
	hash: string
	ingredients: string
	instructions: string
	metadata: Record<string, unknown>
	original_content: string
	title: string
}
