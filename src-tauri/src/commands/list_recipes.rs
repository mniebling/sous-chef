use crate::state::{Recipe, RecipeState};


#[tauri::command]
pub async fn list_recipes(
	recipe_state: tauri::State<'_, RecipeState>,
) -> Result<Vec<Recipe>, String> {

	Ok(recipe_state.list_recipes()?)
}
