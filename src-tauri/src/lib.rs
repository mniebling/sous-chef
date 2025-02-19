mod commands;
mod state;

use tauri::Manager;
use state::RecipeState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_fs::init())
		.invoke_handler(tauri::generate_handler![
			commands::get_recipe::get_recipe,
			commands::list_recipes::list_recipes,
		])
		.setup(|app| {

			if cfg!(debug_assertions) {
				app.handle().plugin(
					tauri_plugin_log::Builder::default()
						.level(log::LevelFilter::Info)
						.build(),
				)?;
			}

			// This text doesn't matter on macOS, the first top level menu will always use the application name.
			let sous_chef_menu = tauri::menu::SubmenuBuilder::new(app, "SousChef")
				.text("about", "About SousChef")
				.separator()
				.text("preferences", "Preferences")
				.separator()
				.quit()
				.build()?;

			let recipes_menu = tauri::menu::SubmenuBuilder::new(app, "Recipes")
				.text("refresh_recipes", "Refresh Recipes")
				.separator()
				.text("import_recipe", "Import Recipe from Website…")
				.build()?;

			let menu = tauri::menu::MenuBuilder::new(app)
				.items(&[
					&sous_chef_menu,
					&recipes_menu,
				])
				.build()?;

			app.set_menu(menu)?;

			app.manage(RecipeState::new());

			Ok(())
		})
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
