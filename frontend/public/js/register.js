document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const API_BASE_URL = "http://localhost:5000";

  const handleRegister = async (e) => {
    e.preventDefault();

    const pseudo = document.getElementById("pseudo").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const registerData = {
        Pseudo: pseudo,
        Email: email,
        Password: password,
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(registerData),
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log("Inscription réussie:", data);
        alert("Inscription réussie! Vous êtes maintenant connecté.");
        window.location.href = "/pages/items.html";
      } else {
        let errorMessage = "Erreur lors de l'inscription";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }

        console.error("Échec de l'inscription:", errorMessage);
        alert("Échec de l'inscription: " + errorMessage);
      }
    } catch (error) {
      console.error("Erreur lors de la tentative d'inscription:", error);
      alert("Erreur d'inscription: Impossible de se connecter au serveur");
    }
  };

  const validatePasswordMatch = () => {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordGroup = confirmPassword.parentElement;

    if (confirmPassword.value && password.value !== confirmPassword.value) {
      passwordGroup.classList.add("error");
    } else {
      passwordGroup.classList.remove("error");
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        window.location.href = "/pages/items.html";
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
    }
  };

  const init = async () => {
    await checkAuthStatus();

    if (registerForm) {
      registerForm.addEventListener("submit", handleRegister);

      const confirmPassword = document.getElementById("confirmPassword");
      confirmPassword.addEventListener("input", validatePasswordMatch);
    }
  };

  init();
});
