import api from "./api";

async function getUsers() {
  const response = await api.get("/users");

  return response.data;
}

async function getMyProfile() {
  const response = await api.get("/users/me");

  return response.data;
}

async function getUserById(idUsuario) {
  const response = await api.get(`/users/${idUsuario}`);

  return response.data;
}

async function createUser(userData) {
  const response = await api.post("/users", userData);

  return response.data;
}

async function updateUser(idUsuario, userData) {
  const response = await api.put(`/users/${idUsuario}`, userData);

  return response.data;
}

async function updateUserStatus(idUsuario, status) {
  const response = await api.patch(`/users/${idUsuario}/status`, {
    status,
  });

  return response.data;
}

async function deleteUser(idUsuario) {
  const response = await api.delete(`/users/${idUsuario}`);

  return response.data;
}

const usersService = {
  getUsers,
  getMyProfile,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};

export default usersService;
