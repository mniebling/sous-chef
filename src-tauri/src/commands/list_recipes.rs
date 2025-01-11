use crate::state::{Recipe, RecipeMetadata, RecipeState};
use gray_matter::{engine::YAML, Matter};
use sha2::{Sha256, Digest};
use std::fs;
use tauri::{Manager, State};

fn read_recipes_from_fs(app_handle: &tauri::AppHandle) -> Result<Vec<Recipe>, String> {

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

			let frontmatter: RecipeMetadata = matter_result.data.as_ref()
				.expect("Frontmatter should not be empty")
				.deserialize()
				.expect("Frontmatter should be deserializable into RecipeMetadata struct");

			// Set the title based on the metadata, or filename if `title` frontmatter is missing
			let title = frontmatter.title.clone() // -> Option<String>
				.unwrap_or_else(|| {
					path.file_stem()
						.and_then(|s| s.to_str()) // Convert OsStr to &str
						.map(|s| s.to_string()) // Convert &str to String
						.unwrap_or("Untitled".to_string())
				});

			let recipe = Recipe {
				content: markdown_content,
				hash,
				metadata: frontmatter,
				title,
			};

			println!("Recipe parsed: {:?}", recipe.metadata);
			recipes.push(recipe);
		}
	}

	Ok(recipes)
}


#[tauri::command]
pub async fn list_recipes(
	app_handle: tauri::AppHandle,
	recipe_state: State<'_, RecipeState>,
) -> Result<Vec<Recipe>, String> {

	let mut recipes = recipe_state.list_recipes()?;

	// This isn't a permanent solution, we'll end up moving the fs access into a wizard
	// or doing it when the app loads or something. But this is fine for right now.
	if recipes.is_empty() {
		recipes = read_recipes_from_fs(&app_handle)?;
		recipe_state.set_recipes(recipes.clone())?;
	}

	Ok(recipes)
}
