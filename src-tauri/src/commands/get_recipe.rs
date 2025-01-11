use crate::state::{Recipe, RecipeState};
use tauri::State;


#[tauri::command]
pub async fn get_recipe(
	recipe_state: State<'_, RecipeState>,
	recipe_hash: String,
) -> Result<Recipe, String> {

	recipe_state
		.get_recipe(&recipe_hash)?
		.ok_or_else(||
			format!("No recipe found with hash: {}", recipe_hash)
		)
}
