import { useEffect, useState } from 'react'
import { emit, invoke } from './events'

export interface RecipeListProps {
	/** Used to force the component to fetch recipes and re-render. */
	dataLastUpdated?: number
}

export function RecipeList(props: RecipeListProps) {

	const [recipes, setRecipes] = useState<Map<string, Recipe>>(new Map())

	// TODO: Try out React 19 action hook here
	useEffect(() => {
		loadRecipes().then((results) => {
			setRecipes(new Map(results.map(r => ([r.pathHash, r]))))
		})
	}, [props.dataLastUpdated])

	return (
		<>
			<strong>Recipes:</strong>
			<ul>
				{ Array.from(recipes).map(([pathHash, recipe]) => (
					<li key={ pathHash }>
						<a
							onClick={ () => emit('web:navigate-to-recipe', { recipeHash: pathHash }) }
							href="#"
						>{ recipe.title }</a>
					</li>
				)) }
			</ul>
		</>
	)
}

async function loadRecipes() {

	try {
		const recipes = await invoke('list_recipes')
		console.info('Loaded recipes:', recipes)
		return recipes
	}
	catch (e) {
		console.error('Error loading recipes', e)
		return []
	}
}
