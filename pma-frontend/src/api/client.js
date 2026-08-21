import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A rejected token means the session is over. Clear it and bounce the user to
// the sign-in page instead of leaving them on a screen where nothing works.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = ["/login", "/register", "/verify-otp"].some((path) =>
      error.config?.url?.startsWith(path)
    );

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default client;