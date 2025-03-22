use serde::{Deserialize, Serialize};
use std::sync::Mutex;


#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Recipe {
	pub content_hash: String,
	/** Raw Markdown containing the parsed Ingredients section. */
	pub ingredients: String,
	/** Raw Markdown containing the parsed Instructions section. */
	pub instructions: String,
	pub metadata: RecipeMetadata,
	/** The full content of the file as originally parsed. We might not need this... */
	pub original_content: String,
	pub path_hash: String,
	pub title: String,
}

// gray_matter's deserializer will only "fill in" properties defined in this struct
// They must be optional or the deserializer will panic if one is not present

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct RecipeMetadata {
	#[serde(skip_serializing_if = "Option::is_none")]
	pub servings: Option<i64>, // TODO: handle non-integer "servings"
	#[serde(skip_serializing_if = "Option::is_none")]
	pub source: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub tags: Option<Vec<String>>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub time: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub title: Option<String>,
}

#[derive(Default)]
pub struct RecipeState {
	recipes: Mutex<Vec<Recipe>>,
}

impl RecipeState {
	pub fn new() -> Self {
		Self {
			recipes: Mutex::new(Vec::new()),
		}
	}

	pub fn list_recipes(&self) -> Result<Vec<Recipe>, String> {
		self.recipes
			.lock()
			.map(|recipes| recipes.clone())
			.map_err(|e| e.to_string())
	}

	pub fn set_recipes(&self, recipes: Vec<Recipe>) -> Result<(), String> {
		self.recipes
			.lock()
			.map_err(|e| e.to_string())? // map the error because Mutex "poison" errors aren't very friendly
			.clone_from(&recipes);

		Ok(())
	}

	pub fn get_recipe(&self, path_hash: &str) -> Result<Option<Recipe>, String> {
		self.recipes
			.lock()
			.map_err(|e| e.to_string())
			.map(|recipes| {
				recipes
					.iter()
					.find(|recipe| recipe.path_hash == path_hash)
					.cloned()
			})
	}
}
