import type { Recipe } from './typings/recipe'

export interface RecipeViewProps {
	recipe?: Recipe
}

export function RecipeView(props: RecipeViewProps) {

	if (!props.recipe) return null

	return (
		<pre>{ props.recipe.content }</pre>
	)
}
