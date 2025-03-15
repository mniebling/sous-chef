import { useEffect, useState } from 'react'
import './App.css'
import { RecipeList } from './RecipeList'
import { RecipeView } from './RecipeView'
import { listen } from './events'


type AppState = {
	selectedRecipeHash: string
	view: ViewName
}

type ViewName =
	| 'recipe-list'
	| 'recipe-view'


export function App() {

	const [appState, setAppState] = useState<AppState>({
		selectedRecipeHash: '',
		view: 'recipe-list',
	})

	// Using an event listener architecture because that's a way Tauri's backend
	// can also communicate with the frontend. We aren't bothered to unregister
	// events because the App component will remain in scope for the entire
	// lifetime of the application.
	useEffect(() => {
		listen('core:invoke-menu', (event) => {
			console.info(event.payload)
		})

		listen('web:navigate-to-recipe', (event) => {
			setAppState({
				selectedRecipeHash: event.payload.recipeHash,
				view: 'recipe-view',
			})
		})

		listen('web:navigate-to-recipes-list', () => {
			setAppState(previous => ({
				...previous,
				view: 'recipe-list',
			}))
		})
	}, [])


	switch (appState.view) {
		case 'recipe-list':
			return <RecipeList />
		case 'recipe-view':
			return <RecipeView recipeHash={ appState.selectedRecipeHash } />
	}
}
