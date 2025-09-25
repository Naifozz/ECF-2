document.addEventListener("DOMContentLoaded", () => {
  const { API_BASE_URL, checkAuth, handleLogout, fetchWithAuth } =
    window.authUtils;
  const recipeForm = document.getElementById("recipeForm");
  const recipesList = document.getElementById("recipesList");
  const formTitle = document.getElementById("formTitle");
  const btnCancel = document.getElementById("btnCancel");
  const btnLogout = document.getElementById("btnLogout");
  const resultItemSelect = document.getElementById("resultItem");

  let editMode = false;
  let allItems = [];

  const fetchItems = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items`, {
        method: "GET",
      });

      if (response.status === 200) {
        allItems = await response.json();
        populateItemSelectors();
      } else {
        console.error("Erreur lors de la récupération des items");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const populateItemSelectors = () => {
    const ingredientSelectors = document.querySelectorAll(".craft-cell");
    ingredientSelectors.forEach((selector) => {
      selector.innerHTML = '<option value="">Aucun</option>';

      allItems.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.ID_Item;
        option.textContent = item.Name;
        selector.appendChild(option);
      });
    });

    resultItemSelect.innerHTML =
      '<option value="">Sélectionner un résultat</option>';
    allItems.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.ID_Item;
      option.textContent = item.Name;
      resultItemSelect.appendChild(option);
    });
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/recipes?ingredients=true`,
        {
          method: "GET",
        }
      );

      if (response.status === 200) {
        const recipes = await response.json();
        displayRecipes(recipes);
      } else {
        console.error("Erreur lors de la récupération des recettes");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Afficher les recettes
  const displayRecipes = (recipes) => {
    const groupedRecipes = {};
    recipes.forEach((item) => {
      if (!groupedRecipes[item.ID_Recipe]) {
        groupedRecipes[item.ID_Recipe] = {
          ID_Recipe: item.ID_Recipe,
          ID_Item_Result: item.ID_Item_Result,
          ingredients: [],
        };
      }
      if (item.ID_Item) {
        groupedRecipes[item.ID_Recipe].ingredients.push({
          ID_Item: item.ID_Item,
          Name: item.Name,
          Position: item.Position,
        });
      }
    });

    recipesList.innerHTML = "";

    Object.values(groupedRecipes).forEach((recipe) => {
      const recipeCard = document.createElement("div");
      recipeCard.className = "recipe-card";

      const resultItem = allItems.find(
        (item) => item.ID_Item === recipe.ID_Item_Result
      );

      let gridHTML = '<div class="recipe-grid">';
      for (let pos = 1; pos <= 9; pos++) {
        const ingredient = recipe.ingredients.find(
          (ing) => ing.Position === pos
        );
        if (ingredient) {
          const itemImg =
            allItems.find((item) => item.ID_Item === ingredient.ID_Item)
              ?.Image_Path || "";
          gridHTML += `<div class="recipe-grid-item"><img src="../${itemImg}" alt="${ingredient.Name}"></div>`;
        } else {
          gridHTML += '<div class="recipe-grid-item"></div>';
        }
      }
      gridHTML += "</div>";

      const resultHTML = resultItem
        ? `<div class="recipe-result">
              <img src="../${resultItem.Image_Path}" alt="${resultItem.Name}" class="recipe-result-img">
              <h3>${resultItem.Name}</h3>
            </div>`
        : "";

      recipeCard.innerHTML = `
            <h3>Recette #${recipe.ID_Recipe}</h3>
            ${gridHTML}
            ${resultHTML}
            <div class="controls">
              <button class="btn-edit" data-id="${recipe.ID_Recipe}">Modifier</button>
              <button class="btn-delete" data-id="${recipe.ID_Recipe}">Supprimer</button>
            </div>
          `;

      recipesList.appendChild(recipeCard);
    });

    document.querySelectorAll(".btn-edit").forEach((button) => {
      button.addEventListener("click", (e) => {
        const recipeId = e.target.getAttribute("data-id");
        editRecipe(recipeId);
      });
    });

    document.querySelectorAll(".btn-delete").forEach((button) => {
      button.addEventListener("click", (e) => {
        const recipeId = e.target.getAttribute("data-id");
        deleteRecipe(recipeId);
      });
    });
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();

    const recipeId = document.getElementById("recipeId").value;
    const resultItemId = resultItemSelect.value;

    if (!resultItemId) {
      alert("Veuillez sélectionner un item résultat");
      return;
    }

    // Collecter les ingrédients
    const ingredients = [];
    for (let pos = 1; pos <= 9; pos++) {
      const ingredientSelect = document.getElementById(`ingredient${pos}`);
      const itemId = ingredientSelect.value;

      if (itemId) {
        ingredients.push({
          ID_Item: parseInt(itemId),
          Position: pos,
        });
      }
    }

    if (ingredients.length === 0) {
      alert("Veuillez ajouter au moins un ingrédient");
      return;
    }

    const recipeData = {
      ID_Item_Result: parseInt(resultItemId),
      ingredients: ingredients,
    };

    try {
      let response;
      let url = `${API_BASE_URL}/api/recipes`;

      if (editMode) {
        url += `?id=${recipeId}`;
        response = await fetchWithAuth(url, {
          method: "PUT",
          body: JSON.stringify(recipeData),
        });
      } else {
        response = await fetchWithAuth(url, {
          method: "POST",
          body: JSON.stringify(recipeData),
        });
      }

      if (response.status === 200 || response.status === 201) {
        resetForm();
        fetchRecipes();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message || "Une erreur est survenue"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const editRecipe = async (recipeId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/recipes?id=${recipeId}&ingredients=true`,
        {
          method: "GET",
        }
      );

      if (response.status === 200) {
        const recipe = await response.json();

        document.getElementById("recipeId").value = recipe.ID_Recipe;
        document.getElementById("resultItem").value = recipe.ID_Item_Result;

        for (let pos = 1; pos <= 9; pos++) {
          document.getElementById(`ingredient${pos}`).value = "";
        }

        recipe.Ingredients.forEach((ingredient) => {
          document.getElementById(`ingredient${ingredient.Position}`).value =
            ingredient.ID_Item;
        });

        editMode = true;
        formTitle.textContent = "Modifier la recette";
        btnCancel.style.display = "inline-block";
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const deleteRecipe = async (recipeId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/recipes?id=${recipeId}`,
          {
            method: "DELETE",
          }
        );

        if (response.status === 200) {
          fetchRecipes();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.message || "Une erreur est survenue"}`);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur is survenue lors de la suppression");
      }
    }
  };

  const resetForm = () => {
    recipeForm.reset();
    document.getElementById("recipeId").value = "";
    editMode = false;
    formTitle.textContent = "Créer une nouvelle recette";
    btnCancel.style.display = "none";
  };

  const init = async () => {
    const isAuth = await checkAuth();
    if (!isAuth) return;

    await fetchItems();
    fetchRecipes();

    recipeForm.addEventListener("submit", handleRecipeSubmit);
    btnCancel.addEventListener("click", resetForm);
    btnLogout.addEventListener("click", handleLogout);
  };

  init();
});
