import { homeDir } from '@tauri-apps/api/path'
import { readTextFile } from '@tauri-apps/plugin-fs'
import { useEffect, useState } from 'react'


export function App() {

	const [recipe, setRecipe] = useState<string>('')

	useEffect(() => {
		loadRecipe().then(content => {
			setRecipe(content)
		})
	}, [])

	return (
		<>
			<h1>SousChef</h1>
			<pre>{ recipe }</pre>
		</>
	)
}

// First step is using Tauri's fs access to grab a recipe file and start experimenting with rendering.
async function loadRecipe() {

	try {
		const home = await homeDir()
		const iCloudPath = `${home}/Library/Mobile Documents/com~apple~CloudDocs/Family/Recipes`
		const filePath = `${iCloudPath}/pork green chili.md`

		const content = await readTextFile(filePath)

		return content
	}
	catch (e) {
		console.error('Error reading file', e)
	}
}
