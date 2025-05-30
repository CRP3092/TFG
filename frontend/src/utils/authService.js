import config from "./config";

export const fetchWithAuth = async (url, options = {}) => {
  try {
    let accessToken = sessionStorage.getItem("accessToken");

    // Si no hay accessToken, intenta renovarlo con refreshToken
    if (!accessToken) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        const res = await fetch(`${config.API_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const { accessToken: newToken } = await res.json();
          sessionStorage.setItem("accessToken", newToken);
          accessToken = newToken;
        } else {
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("accessToken");
          alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
          window.location.href = "/login";
          return;
        }
      }
    }

    // Realiza la petición con el token actualizado
    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
    });

  } catch (error) {
    console.error("Error en la autenticación:", error);
    alert("Error al conectar con el servidor.");
    window.location.href = "/login";
  }
};
