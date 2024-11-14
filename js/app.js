const recipeGrid = document.getElementById('recipeGrid');
const searchInput = document.getElementById('searchInput');
const apiKey = '8e0ff7f46df04ec78142ef6884868fc1';

const favorites = JSON.parse(localStorage.getItem('favorites')) || {};

async function fetchRecipes(query = '', category = '') {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query || category}&number=20&apiKey=${apiKey}`);
        const data = await response.json();
        displayRecipes(data.results);
    } catch (error) {
        console.error("Error fetching recipes from Spoonacular API:", error);
    }
}

function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button class="favorite-btn" onclick="toggleFavorite(${recipe.id})">
                ${favorites[recipe.id] ? '❤️ Remove Favorite' : '♡ Add to Favorite'}
            </button>
        `;
        recipeCard.addEventListener('click', () => fetchRecipeDetails(recipe.id));
        recipeGrid.appendChild(recipeCard);
    });
}

async function fetchRecipeDetails(recipeId) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();
        displayRecipeDetails(recipe);
    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
}

function displayRecipeDetails(recipe) {
    recipeGrid.innerHTML = `
        <div class="recipe-details">
            <h2>${recipe.title}</h2>
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>Instructions</h3>
            <p>${recipe.instructions || 'Instructions not available.'}</p>
            <button onclick="fetchRecipes()">Back to Recipes</button>
        </div>
    `;
}

function toggleFavorite(recipeId) {
    favorites[recipeId] = !favorites[recipeId];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    fetchRecipes();
}

function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    fetchRecipes(searchTerm);
}

function filterCategory(category) {
    if (category === 'all') {
        fetchRecipes();
    } else {
        fetchRecipes('', category);
    }
}

fetchRecipes();
