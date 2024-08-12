document.addEventListener('DOMContentLoaded', () => {
    // Local Storage Key
    const FOOD_STORAGE_KEY = 'foods';

    // Select elements
    const searchBtn = document.getElementById('search-btn');
    const mealList = document.getElementById('meal');
    const mealDetailsContent = document.querySelector('.meal-details-content');
    const recipeCloseBtn = document.getElementById('recipe-close-btn');
    const addFoodBtn = document.getElementById('add-food-btn');
    const foodList = document.getElementById('food-list');
    const foodNameInput = document.getElementById('food-name');
    const foodImageInput = document.getElementById('food-image');
    const foodNutrientsInput = document.getElementById('food-nutrients');
    const foodInstructionsInput = document.getElementById('food-instructions');

    // Modal elements
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalNutrients = document.getElementById('modal-nutrients');
    const modalInstructions = document.getElementById('modal-instructions');
    const modalClose = document.getElementById('modal-close');

    // Event Listeners
    searchBtn.addEventListener('click', searchMeals);
    mealList.addEventListener('click', getMealRecipe);
    recipeCloseBtn.addEventListener('click', () => {
        mealDetailsContent.parentElement.classList.remove('showRecipe');
    });
    addFoodBtn.addEventListener('click', addFood);
    foodList.addEventListener('click', deleteFood);
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Search for meals
    function searchMeals() {
        let searchInputTxt = document.getElementById('search-input').value.trim();

        // Fetch meals from API
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
            .then(response => response.json())
            .then(apiData => {
                let html = "";

                // Display API results
                if (apiData.meals) {
                    apiData.meals.forEach(meal => {
                        html += `
                            <div class="meal-item" data-id="${meal.idMeal}">
                                <div class="meal-img">
                                    <img src="${meal.strMealThumb}" alt="food">
                                </div>
                                <div class="meal-name">
                                    <h3>${meal.strMeal}</h3>
                                    <a href="#" class="recipe-btn">Get Recipe</a>
                                </div>
                            </div>
                        `;
                    });
                }

                // Display local foods
                let localFoods = JSON.parse(localStorage.getItem(FOOD_STORAGE_KEY)) || [];
                localFoods.forEach(food => {
                    if (food.name.toLowerCase().includes(searchInputTxt.toLowerCase())) {
                        html += `
                            <div class="meal-item" data-id="local-${localFoods.indexOf(food)}">
                                <div class="meal-img">
                                    <img src="${food.image}" alt="${food.name}">
                                </div>
                                <div class="meal-name">
                                    <h3>${food.name}</h3>
                                    <p><strong>Nutrients:</strong> ${food.nutrients}</p>
                                    <p><strong>Instructions:</strong> ${food.instructions}</p>
                                </div>
                            </div>
                        `;
                    }
                });

                // Show results
                if (html === "") {
                    html = "Sorry, we didn't find any meal!";
                    mealList.classList.add('notFound');
                } else {
                    mealList.classList.remove('notFound');
                }
                mealList.innerHTML = html;
            })
            .catch(error => {
                console.error('Error fetching meal list:', error);
                mealList.innerHTML = "Sorry, there was an error fetching the meal list.";
            });
    }

    // Get meal recipe
    function getMealRecipe(e) {
        e.preventDefault();
        if (e.target.classList.contains('recipe-btn')) {
            let mealItem = e.target.parentElement.parentElement;
            let id = mealItem.dataset.id;

            if (id.startsWith('local-')) {
                // Handle local foods
                let index = parseInt(id.replace('local-', ''));
                let localFoods = JSON.parse(localStorage.getItem(FOOD_STORAGE_KEY)) || [];
                let food = localFoods[index];
                showModal(food);
            } else {
                // Fetch meal recipe from API
                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                    .then(response => response.json())
                    .then(data => mealRecipeModal(data.meals))
                    .catch(error => {
                        console.error('Error fetching meal recipe:', error);
                        mealDetailsContent.innerHTML = "Sorry, there was an error fetching the meal recipe.";
                        mealDetailsContent.parentElement.classList.add('showRecipe');
                    });
            }
        }
    }

    // Create a meal recipe modal
    function mealRecipeModal(meal) {
        meal = meal[0];
        let html = `
            <h2 class="recipe-title">${meal.strMeal}</h2>
            <p class="recipe-category">${meal.strCategory}</p>
            <div class="recipe-instruct">
                <h3>Instructions:</h3>
                <p>${meal.strInstructions}</p>
            </div>
            <div class="recipe-meal-img">
                <img src="${meal.strMealThumb}" alt="">
            </div>
            <div class="recipe-link">
                <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
            </div>
        `;
        mealDetailsContent.innerHTML = html;
        mealDetailsContent.parentElement.classList.add('showRecipe');
    }

    // Show modal with food details
    function showModal(food) {
        modalImage.src = food.image;
        modalName.textContent = food.name;
        modalNutrients.textContent = food.nutrients;
        modalInstructions.textContent = food.instructions;
        modal.style.display = 'flex';
    }

    // Add food to local storage
    function addFood() {
        const name = foodNameInput.value.trim();
        const image = foodImageInput.value.trim();
        const nutrients = foodNutrientsInput.value.trim();
        const instructions = foodInstructionsInput.value.trim();
       
        if (name && image && nutrients && instructions) {
            const food = {
                name: name,
                image: image,
                nutrients: nutrients,
                instructions: instructions
            };

            let foods = JSON.parse(localStorage.getItem(FOOD_STORAGE_KEY)) || [];
            foods.push(food);
            localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(foods));

            displayFoods();
            clearForm();
        } else {
            alert('Please fill in all fields.');
        }
    }

    // Display foods from local storage
    function displayFoods() {
        let foods = JSON.parse(localStorage.getItem(FOOD_STORAGE_KEY)) || [];
        let html = '';
        foods.forEach((food, index) => {
            html += `
                <div class="food-info-item" data-index="${index}">
                    <h3>${food.name}</h3>
                    <img src="${food.image}" alt="${food.name}">
                    <p><strong>Nutrients:</strong> ${food.nutrients}</p>
                    <p><strong>Instructions:</strong> ${food.instructions}</p>
                    <button data-index="${index}">Delete</button>
                </div>
            `;
        });
        foodList.innerHTML = html;
    }

    // Delete food from local storage
    function deleteFood(e) {
        if (e.target.tagName === 'BUTTON') {
            const index = e.target.getAttribute('data-index');
            let foods = JSON.parse(localStorage.getItem(FOOD_STORAGE_KEY)) || [];
            foods.splice(index, 1);
            localStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(foods));
            displayFoods();
        }
    }

    // Clear form inputs
    function clearForm() {
        foodNameInput.value = '';
        foodImageInput.value = '';
        foodNutrientsInput.value = '';
        foodInstructionsInput.value = '';
    }

    // Initial display of foods
    displayFoods();
});
document.addEventListener('DOMContentLoaded', () => {
    const FOOD_STORAGE_KEY = 'foods';
    const LIKE_STORAGE_KEY = 'likes';
    const COMMENT_STORAGE_KEY = 'comments';

    // All existing code...

    // Event Listeners for Like and Comment
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('like-btn')) {
            handleLike(e.target);
        } else if (e.target.classList.contains('comment-btn')) {
            handleComment(e.target);
        }
    });

    // Function to handle likes
    function handleLike(button) {
        const mealItem = button.closest('.meal-item, .food-info-item');
        const id = mealItem.dataset.id;
        const likes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY)) || {};
        likes[id] = (likes[id] || 0) + 1;

        localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(likes));
        updateLikeCount(button, likes[id]);
    }

    function updateLikeCount(button, count) {
        button.querySelector('.like-count').textContent = count;
    }

    // Function to handle comments
    function handleComment(button) {
        const commentInput = button.previousElementSibling;
        const mealItem = button.closest('.meal-item, .food-info-item');
        const id = mealItem.dataset.id;
        const comments = JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY)) || {};
        comments[id] = comments[id] || [];

        if (commentInput.value.trim() !== "") {
            comments[id].push(commentInput.value.trim());
            localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(comments));
            displayComments(mealItem, comments[id]);
            commentInput.value = "";
        }
    }

    function displayComments(mealItem, comments) {
        const commentList = mealItem.querySelector('.comment-list');
        commentList.innerHTML = comments.map(comment => `<p>${comment}</p>`).join('');
    }

    // Load likes and comments from storage on page load
    function loadLikesAndComments() {
        const likes = JSON.parse(localStorage.getItem(LIKE_STORAGE_KEY)) || {};
        const comments = JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY)) || {};

        document.querySelectorAll('.meal-item, .food-info-item').forEach(mealItem => {
            const id = mealItem.dataset.id;
            if (likes[id]) {
                updateLikeCount(mealItem.querySelector('.like-btn'), likes[id]);
            }
            if (comments[id]) {
                displayComments(mealItem, comments[id]);
            }
        });
    }

    loadLikesAndComments();
});
