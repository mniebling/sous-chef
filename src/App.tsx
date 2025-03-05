import { listen } from '@tauri-apps/api/event'
import { useEffect, useState } from 'react'
import './App.css'
import { RecipeList } from './RecipeList'
import { RecipeView } from './RecipeView'


type AppState = {
	selectedRecipeHash: string
	view: ViewName
}

type ViewName =
	| 'recipe-list'
	| 'recipe-view'

const EVENTS = {
	NAVIGATE_TO_RECIPE: 'web:navigate-to-recipe',
	NAVIGATE_TO_RECIPES_LIST: 'web:navigate-to-recipes-list',
}

export function App() {

	const [appState, setAppState] = useState<AppState>({
		selectedRecipeHash: '',
		view: 'recipe-list',
	})

	// Using an event listener architecture because that's a way Tauri's backend
	// can also communicate with the frontend.
	useEffect(() => {
		// TODO: type-safe event payloads
		function navigateToRecipeHandler(event) {
			setAppState({
				selectedRecipeHash: event.detail?.recipeHash || '',
				view: 'recipe-view',
			})
		}

		function navigateToRecipesListHandler() {
			setAppState(previous => ({
				...previous,
				view: 'recipe-list',
			}))
		}

		// TODO: centralize event listener
		window.addEventListener(EVENTS.NAVIGATE_TO_RECIPE, navigateToRecipeHandler as EventListener)
		window.addEventListener(EVENTS.NAVIGATE_TO_RECIPES_LIST, navigateToRecipesListHandler as EventListener)

		return () => {
			window.removeEventListener(EVENTS.NAVIGATE_TO_RECIPE, navigateToRecipeHandler as EventListener)
			window.removeEventListener(EVENTS.NAVIGATE_TO_RECIPES_LIST, navigateToRecipesListHandler as EventListener)
		}
	}, [])

	// TODO: Temporary code for menu event listening, modularize this later.
	useEffect(() => {

		// TODO: The generic param is the payload; it's not really a string
		// Also this promise is super awkward, we'll get it out of Effects.
		let unlisten = undefined

		listen<string>('core:invoke-menu', (event) => {
			console.info(event.payload)
		})
		.then(result => {
			unlisten = result
		})

		return () => {
			unlisten()
		}
	}, [])

	switch (appState.view) {
		case 'recipe-list':
			return <RecipeList />
		case 'recipe-view':
			return <RecipeView recipeHash={ appState.selectedRecipeHash } />
	}
}
