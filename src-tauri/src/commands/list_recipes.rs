use gray_matter::{engine::YAML, Matter};
use sha2::{Sha256, Digest};
use std::fs;
use tauri::Manager;


#[derive(Debug, serde::Serialize)]
pub struct Recipe {
	content: String,
	hash: String,
	title: String,
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

			// Parse out the frontmatter
			let matter = Matter::<YAML>::new();

			let matter_result = matter.parse(&content);
			let markdown_content = matter_result.content;

			// Set the title based on the metadata
			let title = matter_result.data.as_ref()
				.expect("Frontmatter should not be empty")
				.as_hashmap()
				.expect("Frontmatter should be parseable into a HashMap")
				.get("title") // -> Option<&Pod>
				.and_then(|v| v.as_string().ok()) // -> Option<String>
				.unwrap_or_else(|| {
					path.file_stem()
						.and_then(|s| s.to_str()) // Convert OsStr to &str
						.map(|s| s.to_string()) // Convert &str to String
						.unwrap_or("Untitled".to_string())
				});

			// Add it to our in-memory list
			recipes.push(Recipe {
				content: markdown_content,
				hash,
				title,
			});
		}
	}

	Ok(recipes)
}
