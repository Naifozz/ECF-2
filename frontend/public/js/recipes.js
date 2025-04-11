document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:5000";
  const recipeForm = document.getElementById("recipeForm");
  const recipesList = document.getElementById("recipesList");
  const formTitle = document.getElementById("formTitle");
  const btnCancel = document.getElementById("btnCancel");
  const btnLogout = document.getElementById("btnLogout");
  const resultItemSelect = document.getElementById("resultItem");

  let editMode = false;
  let allItems = [];

  // Vérifier si l'utilisateur est connecté
  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status !== 200) {
        // Rediriger vers la page de connexion si non connecté
        window.location.href = "/pages/login.html";
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      window.location.href = "/pages/login.html";
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 200) {
        window.location.href = "/pages/login.html";
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Récupérer tous les items pour les sélecteurs
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "GET",
        credentials: "include",
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

  // Remplir les sélecteurs d'items
  const populateItemSelectors = () => {
    // Ajouter l'option vide pour les ingrédients
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

    // Remplir le sélecteur de résultat
    resultItemSelect.innerHTML = '<option value="">Sélectionner un résultat</option>';
    allItems.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.ID_Item;
      option.textContent = item.Name;
      resultItemSelect.appendChild(option);
    });
  };

  // Récupérer toutes les recettes
  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/ingredients`, {
        method: "GET",
        credentials: "include",
      });

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
    // Organiser les recettes par ID_Recipe
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

      // Trouver l'item résultat
      const resultItem = allItems.find((item) => item.ID_Item === recipe.ID_Item_Result);

      // Créer la grille de craft
      let gridHTML = '<div class="recipe-grid">';
      for (let pos = 1; pos <= 9; pos++) {
        const ingredient = recipe.ingredients.find((ing) => ing.Position === pos);
        if (ingredient) {
          const itemImg =
            allItems.find((item) => item.ID_Item === ingredient.ID_Item)?.Image_Path || "";
          gridHTML += `<div class="recipe-grid-item"><img src="../${itemImg}" alt="${ingredient.Name}"></div>`;
        } else {
          gridHTML += '<div class="recipe-grid-item"></div>';
        }
      }
      gridHTML += "</div>";

      // Résultat de la recette
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

    // Ajouter les écouteurs d'événements pour les boutons d'édition et de suppression
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

  // Ajouter ou mettre à jour une recette
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

    // Correction ici: s'assurer que ingredients est bien envoyé comme un tableau
    const recipeData = {
      ID_Item_Result: parseInt(resultItemId),
      ingredients: ingredients, // Utiliser 'ingredients' au lieu de 'Ingredients'
    };

    try {
      let response;

      if (editMode) {
        // Mettre à jour une recette existante
        response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(recipeData),
        });
      } else {
        // Créer une nouvelle recette
        response = await fetch(`${API_BASE_URL}/recipes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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

  // Éditer une recette
  const editRecipe = async (recipeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/ingredients/${recipeId}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        const recipe = await response.json();

        document.getElementById("recipeId").value = recipe.ID_Recipe;
        document.getElementById("resultItem").value = recipe.ID_Item_Result;

        // Réinitialiser tous les sélecteurs d'ingrédients
        for (let pos = 1; pos <= 9; pos++) {
          document.getElementById(`ingredient${pos}`).value = "";
        }

        // Remplir les sélecteurs d'ingrédients
        recipe.Ingredients.forEach((ingredient) => {
          document.getElementById(`ingredient${ingredient.Position}`).value = ingredient.ID_Item;
        });

        editMode = true;
        formTitle.textContent = "Modifier la recette";
        btnCancel.style.display = "inline-block";
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Supprimer une recette
  const deleteRecipe = async (recipeId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.status === 200) {
          fetchRecipes();
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.message || "Une erreur est survenue"}`);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue lors de la suppression");
      }
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    recipeForm.reset();
    document.getElementById("recipeId").value = "";
    editMode = false;
    formTitle.textContent = "Créer une nouvelle recette";
    btnCancel.style.display = "none";
  };

  // Initialisation
  const init = async () => {
    await checkAuth();
    await fetchItems();
    fetchRecipes();

    recipeForm.addEventListener("submit", handleRecipeSubmit);
    btnCancel.addEventListener("click", resetForm);
    btnLogout.addEventListener("click", handleLogout);
  };

  init();
});
