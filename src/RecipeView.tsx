import { useEffect, useState } from 'react'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import type { Recipe } from './typings/recipe'

export interface RecipeViewProps {
	recipe?: Recipe
}

export function RecipeView(props: RecipeViewProps) {

	const [html, setHtml] = useState<string>('')

	useEffect(() => {
		if (!props.recipe?.content) return

		unified()
			.use(remarkParse) // convert the Markdown into an AST (mdast)
			.use(remarkRehype) // convert the Markdown AST into an HTML AST (hast)
			.use(rehypeSanitize) // remove dangerous tags
			.use(rehypeStringify) // convert the HTML AST into an HTML string
			.process(props.recipe.content)
			.then(file => {
				setHtml(String(file))
			})
	}, [props.recipe?.content])

	return (
		<div>
			<pre>{ JSON.stringify(props.recipe?.metadata, null, 2) }</pre>
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</div>
	)
}
