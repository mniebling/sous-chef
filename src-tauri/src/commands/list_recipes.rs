use gray_matter::{engine::YAML, Matter};
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::fs;
use tauri::Manager;


#[derive(Debug, Serialize)]
pub struct Recipe {
	content: String,
	hash: String,
	metadata: RecipeMetadata,
	title: String,
}

// gray_matter's deserializer will only "fill in" properties defined in this struct
// They must be optional or the deserializer will panic if one is not present

#[derive(Clone, Debug, Deserialize, Serialize)]
struct RecipeMetadata {
	#[serde(skip_serializing_if = "Option::is_none")]
	servings: Option<i64>, // TODO: handle non-integer "servings"
	#[serde(skip_serializing_if = "Option::is_none")]
	source: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	tags: Option<Vec<String>>,
	#[serde(skip_serializing_if = "Option::is_none")]
	time: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	title: Option<String>,
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

			// Add it to our in-memory list
			recipes.push(recipe);
		}
	}

	Ok(recipes)
}
