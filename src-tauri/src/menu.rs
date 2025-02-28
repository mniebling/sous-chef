use tauri::{
	menu::{Menu, MenuBuilder, MenuEvent, SubmenuBuilder}, App, AppHandle, Runtime, Emitter
};

/**
 * Returns the menu structure for the application.
 * It's consumed by `lib.rs` as part of the app setup.
 */
pub fn create_app_menu<R: Runtime>(app: &App<R>) -> Menu<R> {

	// This text doesn't matter on macOS, the first top level menu will always use the application name.
	let sous_chef_menu = SubmenuBuilder::new(app, "SousChef")
		.text("about", "About SousChef")
		.separator()
		.text("preferences", "Preferences")
		.separator()
		.quit()
		.build();

	let recipes_menu = SubmenuBuilder::new(app, "Recipes")
		.text("refresh_recipes", "Refresh Recipes")
		.separator()
		.text("import_recipe", "Import Recipe from Website…")
		.build();

	let menu_result = MenuBuilder::new(app)
		.items(&[
			&sous_chef_menu.expect("Failed to build SousChef submenu"),
			&recipes_menu.expect("Failed to build Recipes submenu"),
		])
		.build()
		.map_err(|e| e.to_string());

	match menu_result {
		Ok(menu) => menu,
		Err(err) => panic!("Failed to build application menu: {}", err),
	}
}

/**
 * A pattern matcher that handles application menu events.
 * It either does work in the Tauri layer or emits events to the frontend.
 * Some events emit to the frontend, which invokes a command right back; this is useful so the frontend can do async UI updates.
 */
pub fn handle_menu_event(app: &AppHandle, event: MenuEvent) {

	match event.id().0.as_str() {
		"about" => {
			app.emit("core:invoke-menu:about", {})
				.expect("Failed to emit core:invoke-menu:about");
		},
		"preferences" => {
			app.emit("core:invoke-menu:preferences", {})
				.expect("Failed to emit core:invoke-menu:preferences");
		},
		"refresh_recipes" => {
			app.emit("core:invoke-menu:refresh-recipes", {})
				.expect("Failed to emit core:invoke-menu:refresh-recipes");
		},
		"import_recipe" => {
			app.emit("core:invoke-menu:import-recipe", {})
				.expect("Failed to emit core:invoke-menu:import-recipe");
		},
		_ => {
			println!("Unexpected menu event: {:?}", event);
		}
	};
}
