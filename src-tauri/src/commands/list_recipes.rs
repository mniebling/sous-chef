use sha2::{Sha256, Digest};
use std::fs;
use tauri::Manager;


#[derive(Debug, serde::Serialize)]
pub struct Recipe {
	content: String,
	hash: String,
}

#[tauri::command]
pub async fn list_recipes(app_handle: tauri::AppHandle) -> Result<Vec<Recipe>, String> {
	// Still hard-coding the recipes folder to my own iCloud Drive.
	let recipes_dir = app_handle
		.path()
		.home_dir()
		.map_err(|e| e.to_string())?
		.join("Library/Mobile Documents/com~apple~CloudDocs/Family/Recipes");

	if !recipes_dir.exists() {
		return Err("Recipes directory not found".to_string());
	}

	let mut recipes = Vec::new();

	for entry in fs::read_dir(recipes_dir).map_err(|e| e.to_string())? {
		let entry = entry.map_err(|e| e.to_string())?;
		let path = entry.path();

		if path.extension().and_then(|s| s.to_str()) == Some("md") {
			// Read the file contents
			let content = fs::read_to_string(&path)
				.map_err(|e| e.to_string())?;

			// Create a hash of the contents
			let mut hasher = Sha256::new();
			hasher.update(&content);
			let hash = format!("{:x}", hasher.finalize());

			recipes.push(Recipe {
				content,
				hash,
			});
		}
	}

	Ok(recipes)
}
