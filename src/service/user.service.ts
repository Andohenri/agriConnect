import Axios from "../lib/axiosInstance";


export const UserService = {
  // Configuration
  BASE_PATH: "/user",

  // 🔐 Authentification
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response = await Axios.post(`auth/signup`, data);
    return response.data;
  },

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    const response = await Axios.post(`auth/signin`, data);
    const authResponse = response.data;
    // Stockage du token pour les futures requêtes
    localStorage.setItem("token", authResponse.token);
    return authResponse;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem("token");
  },

  // 👤 Gestion du profil
  async getCurrentUser(): Promise<User> {
    const response = await Axios.get(`auth/me`);
    return response.data;
  },

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await Axios.patch(`${this.BASE_PATH}/profile`, data);
    return response.data;
  },

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", file);
    
    const response = await Axios.post(
      `${this.BASE_PATH}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // 👥 Gestion des utilisateurs (Admin)
  async getAllUsers(): Promise<User[]> {
    const response = await Axios.get(this.BASE_PATH);
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await Axios.get(`${this.BASE_PATH}/${id}`);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await Axios.put(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  },

  async updateUserStatus(id: string, statut: Statut): Promise<User> {
    const response = await Axios.patch(
      `${this.BASE_PATH}/${id}/status`,
      { statut }
    );
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await Axios.delete(`${this.BASE_PATH}/${id}`);
  },

  // 🔍 Recherche et filtrage
  async searchUsers(query: string): Promise<User[]> {
    const response = await Axios.get(`${this.BASE_PATH}/search`, {
      params: { q: query },
    });
    return response.data;
  },

  async filterUsers(role?: Role, statut?: Statut): Promise<User[]> {
    const response = await Axios.get(`${this.BASE_PATH}/filter`, {
      params: { role, statut },
    });
    return response.data;
  },
};

export default UserService;
