// Not even using a framework or anything to begin.
// First step is using Tauri's fs access to grab a recipe file and start
// experimenting with rendering.

import { homeDir } from '@tauri-apps/api/path'
import { readTextFile } from '@tauri-apps/plugin-fs'


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

loadRecipe().then(content => {

	document.body.innerHTML = content
})
