import { invoke } from '@tauri-apps/api/core'
import { useEffect, useState } from 'react'
import { Recipe } from './typings/recipe'


export function RecipeList() {

	const [recipes, setRecipes] = useState<Map<string, Recipe>>(new Map())

	// TODO: Try out React 19 action hook here
	useEffect(() => {
		loadRecipes().then((results: Recipe[]) => {
			setRecipes(new Map(results.map(r => ([r.hash, r]))))
		})
	}, [])

	return (
		<>
			<strong>Recipes:</strong>
			<ul>
				{ Array.from(recipes).map(([hash, recipe]) => (
					<li key={ hash }>
						<a href="#" onClick={ () => emitNavigationEvent(hash) }>{ recipe.title }</a>
					</li>
				)) }
			</ul>
		</>
	)
}

async function loadRecipes() {

	try {
		const recipes = await invoke('list_recipes') // TODO: type-safe `invoke` calls
		console.log(recipes)
		return recipes
	}
	catch (e) {
		console.error('Error loading recipes', e)
	}
}

function emitNavigationEvent(recipeHash: string) {

	window.dispatchEvent(new CustomEvent('web:navigate-to-recipe', {
		detail: { recipeHash },
	}))
}
