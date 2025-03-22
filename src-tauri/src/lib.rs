mod commands;
mod menu;
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
			commands::read_recipe_data::read_recipe_data,
		])
		.setup(|app| {

			if cfg!(debug_assertions) {
				app.handle().plugin(
					tauri_plugin_log::Builder::default()
						.level(log::LevelFilter::Info)
						.build(),
				)?;
			}

			// Set up the application menus (macOS)
			let menu = menu::create_app_menu(app);
			app.set_menu(menu)?;

			// Bootstrap the Tauri-managed state
			app.manage(RecipeState::new());

			Ok(())
		})
		.on_menu_event(menu::handle_menu_event)
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
