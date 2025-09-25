document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const API_BASE_URL = window.location.origin;

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const loginData = {
        email: email,
        password: password,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth?action=login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log("Connexion réussie:", data);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "/pages/items.html";
      } else {
        let errorMessage = "Identifiants incorrects";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }

        console.error("Erreur de connexion:", errorMessage);
        alert("Échec de la connexion: " + errorMessage);
      }
    } catch (error) {
      console.error("Erreur lors de la tentative de connexion:", error);
      alert("Erreur de connexion: Impossible de se connecter au serveur");
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        window.location.href = "/pages/items.html";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
    }
  };

  const init = async () => {
    await checkAuthStatus();

    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin);
    }
  };

  init();
});
