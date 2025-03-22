import { InvokeOptions, invoke as tauriInvoke } from '@tauri-apps/api/core'
import { EventCallback, Options, emit as tauriEmit, listen as tauriListen, UnlistenFn } from '@tauri-apps/api/event'


// Tauri events have a `payload` property which contains the event data.
// Its `listen` method maps the payload type via `EventCallback<T>`.
export interface EventPayloadMap {
	'core:invoke-menu': {
		menuName: MenuName
	}
	'web:navigate-to-recipe': {
		recipeHash: string
	}
	'web:navigate-to-recipes-list': undefined
}

export type EventName = keyof EventPayloadMap

// Commands are how the frontend communicates with the Tauri backend.
// Note that the underscore case is because the command names are defined by
// their Rust function names and this is the Rust standard style.
export interface CommandMap {
	'get_recipe': {
		args: {
			recipePathHash: string
		}
		response: Recipe
	}
	'list_recipes': {
		args: undefined
		response: Recipe[]
	}
	'read_recipe_data': {
		args: undefined
		response: void
	}
}

export type CommandName = keyof CommandMap

/**
 * A wrapper to constrain Tauri's `emit` method to only SousChef's event names.
 * We aren't using any of Tauri's built-in events; if we do, this will become an extension instead of a straight swap.
 */
export function emit<T extends EventName>(
	event: T,
	payload?: EventPayloadMap[T],
): Promise<void> {

	return tauriEmit(event, payload)
}

/**
 * A wrapper to constrain Tauri's `invoke` method to only SousChef's event names.
 */
export function invoke<T extends CommandName>(
	commandName: T,
	args?: CommandMap[T]['args'],
	options?: InvokeOptions,
): Promise<CommandMap[T]['response']> {

	return tauriInvoke(commandName, args, options)
}

/**
 * A wrapper to constrain Tauri's `listen` method to only SousChef's event names.
 * We aren't using any of Tauri's built-in events; if we do, this will become an extension instead of a straight swap.
 */
export function listen<T extends EventName>(
	event: T,
	handler: EventCallback<EventPayloadMap[T]>,
	options?: Options,
): Promise<UnlistenFn> {

	return tauriListen(event, handler, options)
}
