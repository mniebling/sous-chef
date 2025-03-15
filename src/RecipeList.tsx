import { invoke } from '@tauri-apps/api/core'
import { useEffect, useState } from 'react'
import { emit } from './events'


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
						<a
							onClick={ () => emit('web:navigate-to-recipe', { recipeHash: hash }) }
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
		const recipes = await invoke('list_recipes') // TODO: type-safe `invoke` calls
		console.log(recipes)
		return recipes
	}
	catch (e) {
		console.error('Error loading recipes', e)
	}
}
