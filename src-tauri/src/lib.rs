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

			app.manage(RecipeState::new());

			Ok(())
		})
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
