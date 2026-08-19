import api from "./api";

async function login(credentials) {
  const response = await api.post("/auth/login", credentials);

  return response.data;
}

const authService = {
  login,
};

export default authService;
