import { invoke } from '@tauri-apps/api/core'
import { useEffect, useState } from 'react'
import { RecipeView } from './RecipeView'
import type { Recipe } from './typings/recipe'

// The current approach is that Tauri reads the recipe directory and the frontend
// can fetch the entire list of recipes from it. We create a map of recipes here
// and then allow the user to click a recipe hash (lol) to view its raw Markdown.
// A good next step would be to parse the frontmatter so we can display titles.
export function App() {

	const [recipes, setRecipes] = useState<Map<string, Recipe>>(new Map())
	const [selectedRecipeHash, setSelectedRecipeHash] = useState<string>('')

	useEffect(() => {
		loadRecipes().then((results: Recipe[]) => {
			setRecipes(new Map(results.map(r => ([r.hash, r]))))
		})
	}, [])

	return (
		<>
			<strong>Recipes:</strong>
			<ul>
				{ Array.from(recipes).map(([hash, _recipe]) => (
					<li key={ hash }>
						<a href="#" onClick={ () => setSelectedRecipeHash(hash) }>{ hash }</a>
					</li>
				)) }
			</ul>

			<RecipeView recipe={ recipes.get(selectedRecipeHash) } />
		</>
	)
}

async function loadRecipes() {

	try {
		const recipes = await invoke('list_recipes')
		console.log(recipes)
		return recipes
	}
	catch (e) {
		console.error('Error loading recipes', e)
	}
}
