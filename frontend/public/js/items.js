document.addEventListener("DOMContentLoaded", () => {
  const { API_BASE_URL, checkAuth, handleLogout, fetchWithAuth } =
    window.authUtils;

  const itemForm = document.getElementById("itemForm");
  const itemsList = document.getElementById("itemsList");
  const formTitle = document.getElementById("formTitle");
  const btnCancel = document.getElementById("btnCancel");
  const btnLogout = document.getElementById("btnLogout");

  let editMode = false;

  const fetchItems = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/items`, {
        method: "GET",
      });

      if (response.status === 200) {
        const items = await response.json();
        displayItems(items);
      } else {
        console.error("Erreur lors de la récupération des items");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const displayItems = (items) => {
    itemsList.innerHTML = "";

    items.forEach((item) => {
      const itemCard = document.createElement("div");
      itemCard.className = "item-card";

      itemCard.innerHTML = `
            <img src="../${item.Image_Path}" alt="${item.Name}" class="item-image">
            <h3>${item.Name}</h3>
            <div class="controls">
              <button class="btn-edit" data-id="${item.ID_Item}">Modifier</button>
              <button class="btn-delete" data-id="${item.ID_Item}">Supprimer</button>
            </div>
          `;

      itemsList.appendChild(itemCard);
    });

    document.querySelectorAll(".btn-edit").forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = e.target.getAttribute("data-id");
        editItem(itemId);
      });
    });

    document.querySelectorAll(".btn-delete").forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = e.target.getAttribute("data-id");
        deleteItem(itemId);
      });
    });
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();

    const itemId = document.getElementById("itemId").value;
    const itemName = document.getElementById("itemName").value;
    const itemImage = document.getElementById("itemImage").value;

    const itemData = {
      Name: itemName,
      Image_Path: itemImage,
    };

    try {
      let response;
      let url = `${API_BASE_URL}/api/items`;

      if (editMode) {
        url += `?id=${itemId}`;
        response = await fetchWithAuth(url, {
          method: "PUT",
          body: JSON.stringify(itemData),
        });
      } else {
        response = await fetchWithAuth(url, {
          method: "POST",
          body: JSON.stringify(itemData),
        });
      }

      if (response.status === 200 || response.status === 201) {
        resetForm();
        fetchItems();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.message || "Une erreur est survenue"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const editItem = async (itemId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/items?id=${itemId}`,
        {
          method: "GET",
        }
      );

      if (response.status === 200) {
        const item = await response.json();

        document.getElementById("itemId").value = item.ID_Item;
        document.getElementById("itemName").value = item.Name;
        document.getElementById("itemImage").value = item.Image_Path;

        editMode = true;
        formTitle.textContent = "Modifier l'item";
        btnCancel.style.display = "inline-block";
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const deleteItem = async (itemId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet item ?")) {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/items?id=${itemId}`,
          {
            method: "DELETE",
          }
        );

        if (response.status === 200) {
          fetchItems();
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

  const resetForm = () => {
    itemForm.reset();
    document.getElementById("itemId").value = "";
    editMode = false;
    formTitle.textContent = "Ajouter un nouvel item";
    btnCancel.style.display = "none";
  };

  const init = async () => {
    const isAuth = await checkAuth();
    if (!isAuth) return;

    fetchItems();

    itemForm.addEventListener("submit", handleItemSubmit);
    btnCancel.addEventListener("click", resetForm);
    btnLogout.addEventListener("click", handleLogout);
  };

  init();
});
