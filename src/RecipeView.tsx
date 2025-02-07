import { invoke } from '@tauri-apps/api/core'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import css from './RecipeView.module.css'
import { Recipe } from './typings/recipe'

export interface RecipeViewProps {
	recipeHash: string
}

// TODO: Surface to the user when a recipe hash isn't found.
export function RecipeView(props: RecipeViewProps) {

	const [html, setHtml] = useState<string>('')
	const [recipe, setRecipe] = useState<Recipe | null>(null)
	const [wakeLockError, setWakeLockError] = useState<string | null>(null)

	const wakeLock = useRef<WakeLockSentinel | null>(null)

	// TODO: Try out React 19 action hook here
	useEffect(() => {
		getRecipe(props.recipeHash).then(setRecipe)
	}, [props.recipeHash])

	// TODO: If this works well on-device, abstract this into a hook
	useEffect(() => {
		requestScreenWakeLock()

		return () => {
			releaseScreenWakeLock()
		}
	}, [])

	async function requestScreenWakeLock() {

		try {
			wakeLock.current = await navigator.wakeLock.request('screen')
		}
		catch (err) {
			setWakeLockError(`${err.name}, ${err.message}`)
		}
	}

	async function releaseScreenWakeLock() {

		await wakeLock.current?.release()
		wakeLock.current = null
	}

	useEffect(() => {

		if (!recipe) return

		unified()
			.use(remarkParse) // convert the Markdown into an AST (mdast)
			.use(remarkRehype) // convert the Markdown AST into an HTML AST (hast)
			.use(rehypeSanitize) // remove dangerous tags
			.use(rehypeStringify) // convert the HTML AST into an HTML string
			.process(recipe.content)
			.then(file => {
				setHtml(String(file))
			})
	}, [recipe])

	return (
		<div>
			<nav className={ css.navContainer }>
				<a className={ css.backButton } href="#" onClick={ navigateToRecipesList }>Back</a>

				<span className={ css.recipeTitle }>{ recipe?.title }</span>
			</nav>

			<main className={ css.recipeContainer }>
				<pre>{ JSON.stringify(recipe?.metadata, null, 2) }</pre>
				<div dangerouslySetInnerHTML={{ __html: html }} />

				{ !wakeLock.current?.released && (
					<div className={ classNames(css.screenLockStatus, { [css.isError]: !!wakeLockError }) }>
						{ wakeLockError !== null
							? <span>{ wakeLockError }</span>
							: <span>Display lock: ON</span>
						}
					</div>
				)}
			</main>
		</div>
	)
}

async function getRecipe(recipeHash: string) {

	try {
		const recipe = await invoke('get_recipe', { recipeHash }) // TODO: type-safe `invoke` calls
		console.log(recipe)
		return recipe
	}
	catch (e) {
		console.error('Error getting recipe', e)
	}
}

function navigateToRecipesList() {

	window.dispatchEvent(new CustomEvent('web:navigate-to-recipes-list'))
}
