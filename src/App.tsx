import { useEffect, useState } from 'react'
import './App.css'
import { RecipeList } from './RecipeList'
import { RecipeView } from './RecipeView'
import { invoke, listen } from './events'


type AppState = {
	dataLastUpdated: number
	selectedRecipePathHash: string
	view: ViewName
}

type ViewName =
	| 'first-run'
	| 'recipe-list'
	| 'recipe-view'


export function App() {

	// Current approach is that components fetch their own data from the backend
	// and use this special `dataLastUpdated` property to trigger a refresh if
	// needed by re-rendering the component. An alternative would be to manage the
	// recipes data in this component or in a Context, pass the recipe down into
	// the child components, and have features like "Refresh Recipes" trigger a
	// re-render by updating the props of <App />'s children.
	//
	// I'm not sure which approach will be smarter in the long run. I'm leaning
	// towards this one currently because it feels right to have the child components
	// manage their own data fetching (UI states, etc).
	const [appState, setAppState] = useState<AppState>({
		dataLastUpdated: Date.now(),
		selectedRecipePathHash: '',
		view: 'first-run',
	})

	// When the frontend first loads, it will notify the backend to read recipes
	// from the filesystem. The UI triggers this so that we can show progress to
	// the user if it's taking too long.
	// In the future the client has a db of recipes that we can use while we
	// check to see if they are stale, so this will be very fast to startup.
	useEffect(() => {
		invoke('read_recipe_data').then(() => { // TODO: Handle errors from read_recipe_data
			setAppState(previous => ({ ...previous, view: 'recipe-list' }))
		})
	}, [])

	// Using an event listener architecture because that's a way Tauri's backend
	// can also communicate with the frontend. We aren't bothered to unregister
	// events because the App component will remain in scope for the entire
	// lifetime of the application.
	useEffect(() => {
		listen('core:invoke-menu', (event) => {
			switch (event.payload.menuName) {
				case 'RefreshRecipes':
					invoke('read_recipe_data').then(() => { // TODO: Handle errors from read_recipe_data
						setAppState(previous => ({ ...previous, dataLastUpdated: Date.now() }))
					})
				case 'About':
				case 'ImportRecipe':
				case 'Settings':
					console.info('Event:', event.payload)
			}
		})

		listen('web:navigate-to-recipe', (event) => {
			setAppState(previous => ({
				...previous,
				selectedRecipePathHash: event.payload.recipeHash,
				view: 'recipe-view',
			}))
		})

		listen('web:navigate-to-recipes-list', () => {
			setAppState(previous => ({
				...previous,
				view: 'recipe-list',
			}))
		})
	}, [])

	switch (appState.view) {
		case 'first-run':
			return <p>Loading recipes...</p>
		case 'recipe-list':
			return <RecipeList dataLastUpdated={ appState.dataLastUpdated } />
		case 'recipe-view':
			return <RecipeView
				dataLastUpdated={ appState.dataLastUpdated }
				recipePathHash={ appState.selectedRecipePathHash }
			/>
	}
}
