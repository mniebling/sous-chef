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


// A wrapper to constrain Tauri's `emit` method to only SousChef's event names.
// We aren't using any of Tauri's built-in events; if we do, this will become an extension instead of a straight swap.
export function emit<T extends EventName>(
	event: T,
	payload?: EventPayloadMap[T],
): Promise<void> {

	return tauriEmit(event, payload)
}


// A wrapper to constrain Tauri's `listen` method to only SousChef's event names.
// We aren't using any of Tauri's built-in events; if we do, this will become an extension instead of a straight swap.
export function listen<T extends EventName>(
	event: T,
	handler: EventCallback<EventPayloadMap[T]>,
	options?: Options,
): Promise<UnlistenFn> {

	return tauriListen(event, handler, options)
}
