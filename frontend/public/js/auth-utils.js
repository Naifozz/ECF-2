const API_BASE_URL = window.location.origin;

const getToken = () => {
  return localStorage.getItem("token");
};

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return !!getToken();
};

const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const checkAuth = async () => {
  try {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status !== 200) {
      clearAuth();
      window.location.href = "/login";
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
    clearAuth();
    window.location.href = "/login";
    return false;
  }
};

const handleLogout = async () => {
  try {
    const token = getToken();

    if (token) {
      await fetch(`${API_BASE_URL}/api/auth?action=logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    clearAuth();
    window.location.href = "/login";
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    clearAuth();
    window.location.href = "/login";
  }
};

const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Pas de token d'authentification");
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: authHeaders,
  });

  if (response.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Session expirée");
  }

  return response;
};

window.authUtils = {
  getToken,
  getUser,
  isAuthenticated,
  clearAuth,
  checkAuth,
  handleLogout,
  fetchWithAuth,
  API_BASE_URL,
};
